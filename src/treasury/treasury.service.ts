import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { Repository } from 'typeorm';
import { Family } from 'src/family/entities/family.entity';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { Bill } from './entities/bill.entity';
import { Correlative } from './entities/correlative.entity';

import { Status } from 'src/enrollment/enum/status.enum';
import { CreatePaidDto } from './dto/create-paid.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Rates } from './entities/rates.entity';

@Injectable()
export class TreasuryService {
  private readonly apiUrl = process.env.NUBEFACT_API_URL;
  private readonly apiToken = process.env.NUBEFACT_TOKEN;
  private readonly logger = new Logger('TreasuryService');
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(Family)
    private readonly familyRepository: Repository<Family>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(Correlative)
    private readonly correlativeRepository: Repository<Correlative>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Rates)
    private readonly ratesRepository: Repository<Rates>,
  ) {}

  async createPaid(createPaidDto: CreatePaidDto, debtId: number, user: any) {
    const debt = await this.debtRepository.findOne({
      where: {
        id: debtId,
        student: {
          enrollment: {
            // student: { id: debt.student.id },
            status: Status.PREMATRICULADO,
          },
        },
      },
      relations: {
        concept: true,
        student: {
          person: true,
          enrollment: {
            activityClassroom: {
              grade: {
                level: true,
              },
              classroom: true,
            },
          },
        },
      },
    });

    if (!debt) {
      throw new BadRequestException(
        'No existe deuda de matricula o estudiante ya matriculado',
      );
    }
    if (debt.status) {
      throw new BadRequestException('Deuda ya cancelada');
    }
    if (debt.student.enrollment.length === 0) {
      throw new NotFoundException('No tiene prematricula el estudiante');
    }
    const enrroll = debt.student.enrollment[0];
    const student = debt.student.person;
    const level = enrroll.activityClassroom.grade.level;
    const grade = enrroll.activityClassroom.grade;
    const campus = enrroll.activityClassroom.classroom.campusDetail;
    const family = await this.familyRepository.findOne({
      where: {
        student: { id: debt.student.id },
      },
      relations: {
        respEconomic: true,
        respEnrollment: true,
      },
    });

    const serie = `B${createPaidDto.paymentMethod}${campus.id}${level.id}`;

    const tipoComprobante = 'BOLETA';

    // Obtener el número correlativo
    const numero = await this.getCorrelative(tipoComprobante, serie);

    const client = family.respEnrollment;
    if (!client) {
      throw new NotFoundException('No existe responsable de matricula');
    }
    const boletaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 2, // 2: Boleta
      serie: serie, // Cambia según tu configuración
      numero: numero, // Número correlativo de la boleta
      sunat_transaction: 1,
      cliente_tipo_de_documento: 1, // 1: DNI
      cliente_numero_de_documento: client.docNumber,
      cliente_denominacion:
        client.name + ' ' + client.lastname + ' ' + client.mLastname,
      cliente_direccion: family.address,
      cliente_email: '',
      cliente_email_1: '',
      cliente_email_2: '',
      fecha_de_emision: new Date(),
      moneda: 1, // 1: Soles
      tipo_de_cambio: '',
      porcentaje_de_igv: 18.0,
      total_gravada: '',
      total_exonerada: debt.total,
      total_igv: 0,
      total: debt.total,
      observaciones: `Gracias por su compra. ${serie}`,
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: debt.concept.code,
          descripcion: `${debt.concept.description} - ${student.name} ${student.lastname} ${student.mLastname} - ${grade.name} - ${level.name} - ${campus.name}`,
          cantidad: 1,
          valor_unitario: debt.total,
          precio_unitario: debt.total,
          descuento: '',
          subtotal: debt.total,
          tipo_de_igv: 8,
          igv: 0.0,
          total: debt.total,
          anticipo_regularizacion: false,
          anticipo_documento_serie: '',
          anticipo_documento_numero: '',
        },
      ],
    };

    try {
      const response = await axios.post(this.apiUrl, boletaData, {
        headers: {
          Authorization: `Token token=${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const pay = this.paymentRepository.create({
        concept: { id: debt.concept.id },
        date: new Date(),
        status: true,
        total: debt.total,
        student: { id: debt.student.id },
        user: user.sub,
      });
      const newPay = await this.paymentRepository.save(pay);
      const bill = this.billRepository.create({
        date: new Date(),
        url: response.data.enlace_del_pdf,
        payment: { id: newPay.id },
        serie: response.data.serie,
        numero: response.data.numero,
      });
      const newBill = await this.billRepository.save(bill);

      debt.status = true;
      enrroll.status = Status.MATRICULADO;
      await this.enrollmentRepository.save(enrroll);
      await this.debtRepository.save(debt);

      /**generar deuda */
      const rate = await this.ratesRepository.findOne({
        where: {
          level: { id: level.id },
          campusDetail: { id: campus.id },
          concept: { id: 2 },
        },
        relations: {
          concept: true,
        },
      });
      await this.generateMonthlyDebts(debt.student.id, rate, enrroll.code);

      return newBill;
    } catch (error) {
      await this.undoCorrelative(tipoComprobante, serie);
      this.logger.log(error);
      throw new HttpException(
        `Error al emitir la boleta: ${error.response?.data?.errors || error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async findDebts(studentId: number) {
    const family = await this.familyRepository.findOne({
      where: {
        student: { id: studentId },
      },
      relations: {
        respEconomic: true,
        respEnrollment: true,
      },
    });
    if (!family) {
      throw new NotFoundException('Don´t exist family for this student');
    }

    const debts = await this.debtRepository.find({
      where: {
        student: { id: studentId },
        status: false,
      },
      relations: {
        concept: true,
      },
    });
    const data = {
      debts: debts,
      resp: family.respEnrollment || 'No hay reponsable matrícula ',
    };
    return data;
  }

  async getPaid(user: any) {
    const roles = user.resource_access['appcolegioae'].roles;

    const isAuth = ['administrador-colegio'].some((role) =>
      roles.includes(role),
    );
    let whereCondition: any;

    if (!isAuth) {
      whereCondition.user = {
        user: user.sub,
      };
    }

    const pay = await this.paymentRepository.find({
      where: whereCondition,
    });

    return pay;
  }

  async generateMonthlyDebts(
    studentId: number,
    rate: Rates,
    codeEnrroll: string,
  ) {
    const debts = [];
    const targetYear = 2025; // Año fijo para las deudas

    // Generar deudas desde marzo (2) hasta diciembre (11) para el año 2025
    for (let month = 2; month <= 11; month++) {
      const dateEnd = new Date(targetYear, month + 1, 0); // Último día del mes correspondiente
      const formattedDateEnd = dateEnd.toISOString().split('T')[0]; // Convertir a 'YYYY-MM-DD'
      debts.push(
        this.debtRepository.create({
          dateEnd: formattedDateEnd,
          concept: { id: rate.concept.id },
          student: { id: studentId },
          code: `PEN${month}${dateEnd
            .toLocaleString('es-ES', { month: 'long' })
            .toUpperCase()}${codeEnrroll}`,
          total: rate.total,
          status: false,
          description: dateEnd
            .toLocaleString('es-ES', { month: 'long' })
            .toUpperCase(), // Ej. 'MARZO'
        }),
      );
    }

    // Guardar todas las deudas en una sola operación
    await this.debtRepository.save(debts);
  }

  async getCorrelative(type: string, serie: string): Promise<number> {
    // Inicia una transacción
    return await this.correlativeRepository.manager.transaction(
      async (manager) => {
        // Busca el correlativo para el tipo de comprobante y serie
        let correlative = await manager.findOne(Correlative, {
          where: { type, serie },
        });

        if (!correlative) {
          // Si no existe, crea un nuevo registro con el número inicial
          correlative = manager.create(Correlative, { type, serie, numero: 1 });
          await manager.save(Correlative, correlative);
        } else {
          // Incrementa el número correlativo existente
          correlative.numero += 1;
          await manager.save(Correlative, correlative);
        }

        return correlative.numero;
      },
    );
  }

  async undoCorrelative(type: string, serie: string) {
    const correlative = await this.correlativeRepository.findOne({
      where: { type, serie },
    });
    if (correlative) {
      correlative.numero = correlative.numero - 1;
      await this.correlativeRepository.save(correlative);
    }
  }
}
