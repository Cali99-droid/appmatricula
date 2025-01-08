import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { Between, Repository } from 'typeorm';
import { Family } from 'src/family/entities/family.entity';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { Bill } from './entities/bill.entity';
import { Correlative } from './entities/correlative.entity';

import { Status } from 'src/enrollment/enum/status.enum';
import { CreatePaidDto } from './dto/create-paid.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Rates } from './entities/rates.entity';
import { User } from 'src/user/entities/user.entity';
// import { PDFDocument, rgb } from 'pdf-lib';
// import { Response } from 'express';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPaid(createPaidDto: CreatePaidDto, debtId: number, user: any) {
    // Validar deuda y obtener datos iniciales
    const { debt, serie, family, client, enrroll } = await this.validateDebt(
      createPaidDto,
      debtId,
    );

    // Obtener y reservar correlativo
    const tipoComprobante = 'BOLETA';
    const numero = await this.getCorrelative(tipoComprobante, serie);

    // Preparar datos para Nubefact
    const boletaData = this.generateBoletaData(
      createPaidDto,
      debt,
      family,
      client,
      numero,
      serie,
    );

    try {
      // Crear pago en la base de datos
      const newPay = await this.savePayment(debt, user, `${serie}-${numero}`);

      // Enviar datos a Nubefact
      const response = await this.sendToNubefact(boletaData);

      // Crear registro de boleta
      const newBill = await this.saveBill(response, newPay.id, serie, numero);

      // Actualizar deuda y matrícula
      await this.finalizeDebtAndEnrollment(debt, enrroll);

      // Generar nuevas deudas mensuales
      const rate = await this.ratesRepository.findOne({
        where: {
          level: { id: enrroll.activityClassroom.grade.level.id },
          campusDetail: {
            id: enrroll.activityClassroom.classroom.campusDetail.id,
          },
          concept: { id: 2 }, // Concepto de mensualidades
        },
        relations: {
          concept: true,
        },
      });

      if (!rate) {
        throw new NotFoundException(
          'No se encontró la tarifa para el nivel y sede',
        );
      }

      await this.generateMonthlyDebts(debt.student.id, rate, enrroll.code);

      return newBill;
    } catch (error) {
      // Revertir correlativo en caso de error
      await this.undoCorrelative(tipoComprobante, serie);
      this.logger.error(
        `[PAID] Error al emitir boleta: ${error.message} ${serie} ${numero}`,
      );
      throw new HttpException(
        `[PAID] Error al emitir la boleta: ${error.response?.data?.errors || error.message} ${serie} ${numero} `,
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

  async findPaid(
    user: any,
    startDate: string,
    endDate: string,
    userId: number,
  ) {
    const roles = user.resource_access['appcolegioae'].roles;

    const isAuth = ['administrador-colegio'].some((role) =>
      roles.includes(role),
    );
    console.log(isAuth);
    const whereCondition: any = {
      user: user.sub,
    };
    const whereConditionTwo: any = {};
    if (userId) {
      const userConsult = await this.userRepository.findOneBy({ id: userId });
      whereConditionTwo.user = userConsult.sub;
    }

    const boletas = await this.billRepository.find({
      where: {
        payment: {
          ...(isAuth ? whereConditionTwo : whereCondition),
          date: Between(startDate, endDate), // Filtrar entre las fechas dadas
          student: {
            enrollment: {
              // student: { id: debt.student.id },
              status: Status.MATRICULADO,
            },
          },
        },
      },
      relations: {
        payment: {
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
      },
    });

    // Formatear los datos para el frontend
    const result = boletas.map((boleta) => {
      // const enrroll = debt.student.enrollment[0];

      const student = boleta.payment.student.person;
      const level =
        boleta.payment.student.enrollment[0].activityClassroom.grade.level;
      const grade =
        boleta.payment.student.enrollment[0].activityClassroom.grade;
      const campus =
        boleta.payment.student.enrollment[0].activityClassroom.classroom
          .campusDetail;
      return {
        id: boleta.id,
        date: boleta.date,
        serie: boleta.serie,
        numero: boleta.numero,
        cod: `${boleta.serie}-${boleta.numero}`,
        isAccepted: boleta.accepted,
        url: boleta.url,
        description: `${student.name} ${student.lastname} ${student.mLastname} - ${grade.name} - ${level.name} - ${campus.name}`,
        user: this.getUser(boleta.payment.user),
        payment: {
          id: boleta.payment.id,
          date: boleta.payment.date,
          total: boleta.payment.total,
          status: boleta.payment.status,
          concept: {
            description: boleta.payment.concept.description,
            code: boleta.payment.concept.code,
          },
        },
      };
    });

    // Calcular el total de los pagos
    const total = boletas.reduce(
      (sum, boleta) => sum + boleta.payment.total,
      0,
    );

    return {
      data: result,
      total,
    };
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
          correlative.updatedAt = new Date();
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

  async getStatistics() {
    const registered = await this.enrollmentRepository.count({
      where: {
        status: Status.MATRICULADO,
      },
    });
    const pre_registered = await this.enrollmentRepository.count({
      where: {
        status: Status.PREMATRICULADO,
      },
    });

    const total = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.total)', 'total')
      .where('payment.status = :status', { status: true }) // Considerar solo pagos exitosos
      .getRawOne();

    return {
      registered,
      'pre-registered': pre_registered,
      total: total.total,
    };
  }

  getUser(sub: string) {
    switch (sub) {
      case '272550ea-be37-4d3e-8ee3-b4597ac75fda':
        return 'Jusleth Mejia';
      case '856d8fb4-a94a-4885-9afa-50dd73582933':
        return 'Sonia Huaman';
      case '9f0cfdcf-7176-4244-a057-4488ef85be84':
        return 'Yeraldin  Eugenio';
      default:
        break;
    }
  }
  /**
   *  Jusleth Mejia ID: 974
   *  Sonia Huaman ID: 913
   *  Yeraldin  Eugenio ID: 942
   *
   */
  /**PRIVATE FUNCTIONS */
  /** Validar Deuda */
  private async validateDebt(createPaidDto: CreatePaidDto, debtId: number) {
    const debt = await this.debtRepository.findOne({
      where: {
        id: debtId,
        student: {
          enrollment: {
            status: Status.PREMATRICULADO,
          },
        },
        status: false,
      },
      relations: {
        concept: true,
        student: {
          person: true,
          enrollment: {
            activityClassroom: {
              grade: { level: true },
              classroom: true,
            },
          },
        },
      },
    });

    if (!debt) {
      throw new BadRequestException(
        'No existe deuda o estudiante ya matriculado',
      );
    }

    if (debt.status) {
      throw new BadRequestException('Deuda ya cancelada');
    }

    if (debt.student.enrollment.length === 0) {
      throw new NotFoundException('No tiene prematricula el estudiante');
    }

    const enrroll = debt.student.enrollment[0];
    // const student = debt.student.person;
    const level = enrroll.activityClassroom.grade.level;
    const campus = enrroll.activityClassroom.classroom.campusDetail;

    const family = await this.familyRepository.findOne({
      where: { student: { id: debt.student.id } },
      relations: { respEconomic: true, respEnrollment: { user: true } },
    });

    if (!family?.respEnrollment) {
      throw new NotFoundException('No existe responsable de matrícula');
    }

    const serie = `B${createPaidDto.paymentMethod}${campus.id}${level.id}`;

    return { debt, serie, family, client: family.respEnrollment, enrroll };
  }
  /**Generar Datos para Nubefact */
  private generateBoletaData(
    createPaidDto: CreatePaidDto,
    debt: any,
    family: any,
    client: any,
    numero: number,
    serie: string,
  ) {
    const student = debt.student.person;
    const grade = debt.student.enrollment[0].activityClassroom.grade;
    const level = grade.level;
    const campus =
      debt.student.enrollment[0].activityClassroom.classroom.campusDetail;

    return {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 2,
      serie,
      numero,
      sunat_transaction: 1,
      cliente_tipo_de_documento: 1,
      cliente_numero_de_documento: client.docNumber,
      cliente_denominacion: `${client.name} ${client.lastname} ${client.mLastname}`,
      cliente_direccion: family.address,
      cliente_email: client.user?.email || '',
      fecha_de_emision: new Date(),
      moneda: 1,
      porcentaje_de_igv: 18.0,
      total_gravada: '',
      total_exonerada: debt.total,
      total_igv: 0,
      total: debt.total,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: !!client.user?.email,
      observaciones: `Gracias por su preferencia.`,
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
          tipo_de_igv: 9,
          igv: 0.0,
          total: debt.total,
          anticipo_regularizacion: false,
          anticipo_documento_serie: '',
          anticipo_documento_numero: '',
        },
      ],
    };
  }
  /**enviar a nuberfact */
  private async sendToNubefact(boletaData: any) {
    try {
      const response = await axios.post(this.apiUrl, boletaData, {
        headers: {
          Authorization: `Token token=${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      this.logger.error(
        `[SEND] Error al emitir boleta. Serie: ${boletaData.serie}, Número: ${boletaData.numero}, Detalles: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new HttpException(
        `[SEND] Error al emitir la boleta: ${error.response?.data?.errors || error.message}`,
        error.response?.status || 500,
      );
    }
  }
  /** Crear Pago */
  private async savePayment(debt: any, user: any, receipt: string) {
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        concept: { id: debt.concept.id },
        student: { id: debt.student.id },
      },
    });

    if (existingPayment) {
      const bill = await this.billRepository.findOne({
        where: {
          payment: { id: existingPayment.id },
        },
      });
      if (bill) {
        throw new BadRequestException('Pago ya registrado para esta deuda.');
      }
      existingPayment.receipt = receipt;
      return await this.paymentRepository.save(existingPayment);
    }

    const pay = this.paymentRepository.create({
      concept: { id: debt.concept.id },
      date: new Date(),
      status: true,
      total: debt.total,
      student: { id: debt.student.id },
      user: user.sub,
      receipt,
    });
    return await this.paymentRepository.save(pay);
  }
  /**Crear boleta */
  private async saveBill(
    response: any,
    paymentId: number,
    serie: string,
    numero: number,
  ) {
    const bill = this.billRepository.create({
      date: new Date(),
      url: response.data.enlace_del_pdf,
      payment: { id: paymentId },
      serie,
      numero,
      accepted: response.data.aceptada_por_sunat,
    });
    return await this.billRepository.save(bill);
  }

  /**Finalizar Deuda y Matrícula */
  private async finalizeDebtAndEnrollment(debt: any, enrroll: any) {
    debt.status = true;
    enrroll.status = Status.MATRICULADO;
    await this.enrollmentRepository.save(enrroll);
    await this.debtRepository.save(debt);
  }

  /**generar deudas 10 meses */
  private async generateMonthlyDebts(
    studentId: number,
    rate: Rates,
    codeEnrroll: string,
  ) {
    const debts = [];
    const targetYear = 2025; // Año fijo para las deudas

    for (let month = 2; month <= 11; month++) {
      const dateEnd = new Date(targetYear, month + 1, 0); // Último día del mes
      const formattedDateEnd = dateEnd.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

      const debt = this.debtRepository.create({
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
          .toUpperCase(), // Ejemplo: 'MARZO'
      });

      debts.push(debt);
    }

    try {
      await this.debtRepository.save(debts); // Guardar todas las deudas
      this.logger.log(
        `Deudas generadas correctamente para el estudiante ID: ${studentId}`,
      );
    } catch (error) {
      this.logger.error;
    }
  }

  async migrateToNubeFact() {
    const boletas = await this.billRepository.find({
      where: {
        payment: {
          student: {
            enrollment: {
              status: Status.MATRICULADO,
            },
          },
        },
      },
      relations: {
        payment: {
          concept: true,
          student: {
            family: {
              respEnrollment: true,
            },
            enrollment: {
              activityClassroom: {
                grade: {
                  level: true,
                },
                classroom: true,
              },
            },
            person: true,
          },
        },
      },
    });

    for (const bol of boletas) {
      const student = bol.payment.student.person;
      const resp = bol.payment.student.family.respEnrollment;
      const family = bol.payment.student.family;
      const grade = bol.payment.student.enrollment[0].activityClassroom.grade;
      const campus =
        bol.payment.student.enrollment[0].activityClassroom.classroom
          .campusDetail;
      const level =
        bol.payment.student.enrollment[0].activityClassroom.grade.level;
      const pay = bol.payment;
      const boletaData = {
        operacion: 'generar_comprobante',
        tipo_de_comprobante: 2, // 2: Boleta
        serie: bol.serie, // Cambia según tu configuración
        numero: bol.numero, // Número correlativo de la boleta
        sunat_transaction: 1,
        cliente_tipo_de_documento: 1, // 1: DNI
        cliente_numero_de_documento: resp.docNumber,
        cliente_denominacion:
          resp.name + ' ' + resp.lastname + ' ' + resp.mLastname,
        cliente_direccion: family.address,
        cliente_email: '',
        cliente_email_1: '',
        cliente_email_2: '',
        fecha_de_emision: new Date(),
        moneda: 1, // 1: Soles
        tipo_de_cambio: '',
        porcentaje_de_igv: 18.0,
        total_gravada: '',
        total_exonerada: pay.total,
        total_igv: 0,
        total: pay.total,
        observaciones: `Gracias por su preferencia.`,
        items: [
          {
            unidad_de_medida: 'NIU',
            codigo: pay.concept.code,
            descripcion: `${pay.concept.description.toLocaleUpperCase()}: ${student.lastname} ${student.mLastname} ${student.name} - ${grade.name} ${level.name} - ${campus.name}`,
            cantidad: 1,
            valor_unitario: pay.total,
            precio_unitario: pay.total,
            descuento: '',
            subtotal: pay.total,
            tipo_de_igv: 8,
            igv: 0.0,
            total: pay.total,
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

        bol.url = response.data.enlace_del_pdf;
        bol.accepted = response.data.aceptada_por_sunat;
        bol.updatedAt = new Date();
        await this.billRepository.save(bol);
        console.log(`migrate succesfully boleta ${bol.serie}-${bol.numero} `);
      } catch (error) {
        this.logger.log(error);
        throw new HttpException(
          `Error al emitir la boleta: ${error.response?.data?.errors || error.message}`,
          error.response?.status || 500,
        );
      }
    }
    console.log('migrate succesfully');
  }
}
