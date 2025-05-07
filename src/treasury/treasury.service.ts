import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { Between, In, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
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
import { CreatePaidReserved } from './dto/create-paid-reserved.dto';
import { Concept } from './entities/concept.entity';
import { Person } from 'src/person/entities/person.entity';
import { ConfigService } from '@nestjs/config';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { CreditNote } from './entities/creditNote.entity';
import { PaymentPref } from 'src/family/enum/payment-pref.enum';
import { join } from 'path';
import { writeFileSync } from 'fs';
import * as fs from 'fs';
import * as readline from 'readline';
import { PaymentMethod } from './enum/PaymentMethod.enum';
import { RespProcess } from './interfaces/RespProcess.interface';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { Discounts } from './entities/discounts.entity';
import jsPDF from 'jspdf';
import * as qrcode from 'qrcode';
// import { PDFDocument, rgb } from 'pdf-lib';
// import { Response } from 'express';

@Injectable()
export class TreasuryService {
  private readonly apiUrl = process.env.NUBEFACT_API_URL;
  private readonly apiToken = process.env.NUBEFACT_TOKEN;
  private readonly logger = new Logger('TreasuryService');
  private readonly env = this.configService.getOrThrow('NODE_ENV');

  constructor(
    private readonly configService: ConfigService,
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
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditNote)
    private readonly creditNoteRepository: Repository<CreditNote>,
    @InjectRepository(Discounts)
    private readonly discountsRepository: Repository<Discounts>,
  ) {}

  async createPaid(
    createPaidDto: CreatePaidDto,
    debtId: number,
    user: any,
    datePay = new Date(),
  ) {
    // Validar deuda y obtener datos iniciales
    const { debt, serie, family, client, enrroll } = await this.validateDebt(
      createPaidDto,
      debtId,
    );

    // Obtener y reservar correlativo
    const tipoComprobante = 'BOLETA';
    let numero: number;
    let boletaData: any;
    if (this.env === 'prod') {
      numero = await this.getCorrelative(tipoComprobante, serie);

      // Preparar datos para Nubefact prod
      boletaData = this.generateBoletaData(
        createPaidDto,
        debt,
        family,
        client,
        numero,
        serie,
      );
    } else {
      numero = await this.getCorrelative(tipoComprobante, 'BBB1');

      // Preparar datos para Nubefact dev
      boletaData = this.generateBoletaData(
        createPaidDto,
        debt,
        family,
        client,
        numero,
        'BBB1',
      );
    }

    try {
      // Enviar datos a Nubefact
      const bill = await this.validatePayment(debt, `${serie}-${numero}`);
      let url: string;
      if (bill === null) {
        if (debt.total > 0) {
          const response = await this.sendToNubefact(boletaData);
          url = response.data.enlace_del_pdf;
        } else {
          url =
            'https://apissl-matricula.dev-solware.com/api/v1/treasury/generar/boleta';
        }

        // Crear pago en la base de datos
        const newPay = await this.savePayment(
          debt,
          user,
          `${serie}-${numero}`,
          createPaidDto,
          datePay,
        );

        // Crear registro de boleta
        const newBill = await this.saveBill(url, newPay.id, serie, numero);

        // Generar nuevas deudas mensuales
        if (debt.concept.code === 'C001') {
          // Actualizar deuda y matrícula
          await this.finalizeDebtAndEnrollment(debt, enrroll);
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
        }
        debt.status = true;
        await this.debtRepository.save(debt);
        return newBill;
      } else {
        return bill;
      }
    } catch (error) {
      await this.undoCorrelative(tipoComprobante, serie);
      this.logger.error(
        `[PAID] Error al emitir comprobante: ${error.message} ${serie} ${numero}`,
      );
      throw new HttpException(
        `[PAID] Error al emitir comprobante: ${error.response?.data?.errors || error.message} ${serie} ${numero} `,
        error.response?.status || 500,
      );
    }
  }

  async createPaidReserved(
    createPaidReservedDto: CreatePaidReserved,
    user: any,
  ) {
    const enrrollOnProccess = await this.enrollmentRepository.findOne({
      where: {
        status: Status.EN_PROCESO,
        student: { id: createPaidReservedDto.studentId },
      },
      relations: {
        student: {
          family: true,
        },
      },
    });
    if (!enrrollOnProccess) {
      throw new BadRequestException('Not available ');
    }
    const family = await this.familyRepository.findOne({
      where: {
        id: enrrollOnProccess.student.family.id,
      },
      relations: {
        parentOneId: true,
        parentTwoId: true,
      },
    });
    let resp: Person;

    if (family.parentOneId.id === createPaidReservedDto.parentId) {
      resp = family.parentOneId;
    }

    if (family.parentTwoId.id === createPaidReservedDto.parentId) {
      resp = family.parentTwoId;
    }
    let serie = `B${1}${enrrollOnProccess.activityClassroom.classroom.campusDetail.id}${enrrollOnProccess.activityClassroom.grade.level.id}`;
    const tipoComprobante = 'BOLETA';
    let numero: number;

    if (this.env === 'prod') {
      numero = await this.getCorrelative(tipoComprobante, serie);
    } else {
      serie = 'BBB1';
      numero = await this.getCorrelative(tipoComprobante, 'BBB1');
    }

    try {
      const concept = await this.conceptRepository.findOne({
        where: {
          code: 'C003',
        },
      });
      // console.log(concept);
      // return;
      const student = enrrollOnProccess.student.person;
      const grade = enrrollOnProccess.activityClassroom.grade;
      const section = enrrollOnProccess.activityClassroom.section;
      const level = grade.level;
      const campus = enrrollOnProccess.activityClassroom.classroom.campusDetail;
      const sendEmail = this.env === 'prod' ? !!resp.user?.email : false;
      const boletaData = {
        operacion: 'generar_comprobante',
        tipo_de_comprobante: 2,
        serie: serie,
        numero,
        sunat_transaction: 1,
        cliente_tipo_de_documento: 1,
        cliente_numero_de_documento: resp.docNumber,
        cliente_denominacion: `${resp.name} ${resp.lastname} ${resp.mLastname}`,
        cliente_direccion: family.address,
        cliente_email: resp.user?.email || '',
        fecha_de_emision: new Date(),
        moneda: 1,
        porcentaje_de_igv: 0,
        total_gravada: '',
        total_inafecta: concept.total,
        total: concept.total,
        enviar_automaticamente_a_la_sunat: true,
        enviar_automaticamente_al_cliente: sendEmail,
        observaciones: `Gracias por su preferencia.`,
        items: [
          {
            unidad_de_medida: 'NIU',
            codigo: concept.code,
            descripcion: `${concept.description} - ${student.name} ${student.lastname} ${student.mLastname} - ${grade.name} ${section} - ${level.name} - ${campus.name}`,
            cantidad: 1,
            valor_unitario: concept.total,
            precio_unitario: concept.total,
            descuento: '',
            subtotal: concept.total,
            tipo_de_igv: 9,
            igv: 0.0,
            total: concept.total,
            anticipo_regularizacion: false,
            anticipo_documento_serie: '',
            anticipo_documento_numero: '',
          },
        ],
      };
      const existingPayment = await this.paymentRepository.findOne({
        where: {
          concept: { id: concept.id },
          student: { id: createPaidReservedDto.studentId },
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
        existingPayment.receipt = `${serie}-${numero}`;
        return await this.paymentRepository.save(existingPayment);
      }

      const pay = this.paymentRepository.create({
        concept: { id: concept.id },
        date: new Date(),
        status: true,
        total: concept.total,
        student: { id: createPaidReservedDto.studentId },
        user: user.sub,
        receipt: `${serie}-${numero}`,
      });
      const newPay = await this.paymentRepository.save(pay);
      // Enviar datos a Nubefact
      const response = await this.sendToNubefact(boletaData);
      // console.log(response);
      // Crear registro de boleta
      const newBill = await this.saveBill(
        response.data.enlace_del_pdf,
        newPay.id,
        serie,
        numero,
      );

      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 25);
      enrrollOnProccess.status = Status.RESERVADO;
      enrrollOnProccess.isActive = true;
      enrrollOnProccess.reservationExpiration = newExpirationDate;
      enrrollOnProccess.dateOfChange = new Date();
      await this.enrollmentRepository.save(enrrollOnProccess);

      /**genear deudas */
      const dateEnd = new Date();
      const rate = await this.ratesRepository.findOne({
        where: {
          level: { id: level.id },
          campusDetail: { id: campus.id },
        },
        relations: {
          concept: true,
        },
      });
      const createdDebtEnrrol = this.debtRepository.create({
        dateEnd: new Date(dateEnd.setDate(dateEnd.getDate() + 30)),
        concept: { id: rate.concept.id },
        student: { id: createPaidReservedDto.studentId },
        total: rate.total - concept.total,
        status: false,
        description: enrrollOnProccess.code,
        code: `MAT${enrrollOnProccess.code}`,
        obs: `Descontado de: ${serie}-${numero}`,
      });

      await this.debtRepository.save(createdDebtEnrrol);
      const conceptCuota = await this.conceptRepository.findOne({
        where: {
          code: 'C004',
        },
      });
      const createdDebtCuota = this.debtRepository.create({
        dateEnd: new Date(dateEnd.setDate(dateEnd.getDate() + 30)),
        concept: { id: conceptCuota.id },
        student: { id: createPaidReservedDto.studentId },
        total: conceptCuota.total,
        status: false,
        description: enrrollOnProccess.code,
        code: `CUOTA${enrrollOnProccess.code}`,
        obs: `${conceptCuota.description}`,
      });
      await this.debtRepository.save(createdDebtCuota);
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
        discount: true,
      },
    });
    const data = {
      debts: debts,
      resp: family.respEconomic || 'No hay reponsable matrícula ',
    };
    return data;
  }

  async searchDebtsByDate(studentId: number, date: Date = new Date()) {
    const debts = await this.debtRepository.find({
      where: {
        dateEnd: LessThan(date),
        student: { id: studentId },
        status: false,
      },
      relations: {
        concept: true,
      },
    });

    return debts;
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
            enrollment: [
              {
                // student: { id: debt.student.id },
                status: Status.MATRICULADO,
              },
              {
                // student: { id: debt.student.id },
                status: Status.PREMATRICULADO,
              },
              {
                // student: { id: debt.student.id },
                status: Status.RESERVADO,
              },
              {
                // student: { id: debt.student.id },
                status: Status.EXPIRADO,
              },
            ],
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
    const result = this.formatDataBill(boletas);
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

  async withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (err?.code === 'ER_LOCK_DEADLOCK') {
          lastError = err;
          // Espera aleatoria para evitar colisiones
          await new Promise((res) =>
            setTimeout(res, 100 + Math.random() * 200),
          );
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  }

  async getCorrelative(type: string, serie: string): Promise<number> {
    return await this.withRetry(() =>
      this.correlativeRepository.manager.transaction(async (manager) => {
        let correlative = await manager
          .createQueryBuilder(Correlative, 'c')
          .setLock('pessimistic_write')
          .where('c.type = :type AND c.serie = :serie', { type, serie })
          .getOne();

        if (!correlative) {
          correlative = manager.create(Correlative, { type, serie, numero: 1 });
          await manager.save(Correlative, correlative);
        } else {
          correlative.numero += 1;
          console.log('agregando el numero', correlative.numero);

          correlative.updatedAt = new Date();
          await manager.save(Correlative, correlative);
        }

        return correlative.numero;
      }),
    );
  }

  async undoCorrelative(type: string, serie: string) {
    const correlative = await this.correlativeRepository.findOne({
      where: { type, serie },
    });

    if (correlative) {
      correlative.numero = correlative.numero - 1;
      console.log('Descontando el numero', correlative.numero);
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

  // async createPaymentAdmision(name: string, docNumber: string) {
  //   const rate = await this.ratesRepository.findOne({
  //     where: {
  //       level: { id: levelId },
  //       campusDetail: { id: campusDetailId },
  //     },
  //     relations: {
  //       concept: true,
  //     },
  //   });
  // }

  getUser(sub: string) {
    switch (sub) {
      case '272550ea-be37-4d3e-8ee3-b4597ac75fda':
        return 'Jusleth Mejia';
      case '856d8fb4-a94a-4885-9afa-50dd73582933':
        return 'Sonia Huaman';
      case '9f0cfdcf-7176-4244-a057-4488ef85be84':
        return 'Yeraldin  Eugenio';
      default:
        return sub;
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
    let serie: string;
    const debt = await this.debtRepository.findOne({
      where: {
        id: debtId,
        student: [
          {
            enrollment: {
              status: Status.PREMATRICULADO,
            },
          },
          {
            enrollment: {
              status: Status.MATRICULADO,
            },
          },
        ],
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
        discount: true,
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
      relations: {
        respEconomic: { user: true },
        respEnrollment: { user: true },
      },
    });

    if (!family?.respEnrollment) {
      throw new NotFoundException('No existe responsable de matrícula');
    }

    // eslint-disable-next-line prefer-const
    serie = `B${createPaidDto.paymentMethod}${campus.id}${level.id}`;

    if (debt.discount !== null) {
      debt.total = debt.total - (debt.total * debt.discount.percentage) / 100;
      // serie = `BB${campus.id}${level.id}`;
    }
    if (debt.concept.code === 'C005') {
      // Si es traslado se procede a cancelar las deudas del mes
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const debts = await this.debtRepository.find({
        where: {
          isCanceled: true,
          dateEnd: MoreThanOrEqual(today),
        },
      });

      for (const debt of debts) {
        debt.isCanceled = true;
      }

      await this.debtRepository.save(debts);
    }
    if (debt.concept.code === 'C002') {
      return { debt, serie, family, client: family.respEconomic, enrroll };
    } else {
      return { debt, serie, family, client: family.respEnrollment, enrroll };
    }
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
    const section = debt.student.enrollment[0].activityClassroom.section;
    const level = grade.level;
    const campus =
      debt.student.enrollment[0].activityClassroom.classroom.campusDetail;
    const sendEmail = this.env === 'prod' ? !!client.user?.email : false;
    const pen =
      debt.concept.code === 'C002' ? debt.description.toUpperCase() : '';
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
      fecha_de_vencimiento: new Date(),
      moneda: 1,
      porcentaje_de_igv: 0,
      total_gravada: '',
      total_inafecta: debt.total,
      total: debt.total,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: sendEmail,
      observaciones: `Gracias por su preferencia. ${debt.obs !== null ? debt.obs : ''}`,
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: debt.concept.code,
          descripcion: `${debt.concept.description.toUpperCase() + ' ' + pen} - ${student.name} ${student.lastname} ${student.mLastname} - ${grade.name} ${section} - ${level.name} - ${campus.name}`,
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
        `[Nubefact] Error al emitir voucher. Serie: ${boletaData.serie}, Número: ${boletaData.numero}, Detalles: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new HttpException(
        `[Nubefact] Error al emitir voucher. Serie: ${boletaData.serie}, Número: ${boletaData.numero}, Detalles: ${JSON.stringify(error.response?.data || error.message)}`,
        error.response?.status || 500,
      );
    }
  }
  /** Crear Pago */

  private async validatePayment(debt: any, receipt: string) {
    if (debt.concept.id === 2) {
      const existingPayment = await this.paymentRepository.findOne({
        where: {
          concept: { id: debt.concept.id },
          student: { id: debt.student.id },
          debt: { id: debt.id },
        },
        relations: {
          debt: true,
        },
      });
      if (existingPayment) {
        const bill = await this.billRepository.findOne({
          where: {
            payment: { id: existingPayment.id },
          },
        });
        console.log(
          `Pago ya registrado para esta deuda PENSION ${bill.serie} ${bill.numero}  ${debt.code}`,
        );
        existingPayment.receipt = receipt;
        await this.paymentRepository.save(existingPayment);
        return bill;
      } else {
        console.log('crear nuevo');
        return null;
      }
    }
    if (debt.concept.id != 2) {
      const existingPayment = await this.paymentRepository.findOne({
        where: {
          concept: { id: debt.concept.id },
          student: { id: debt.student.id },
        },
        relations: {
          debt: true,
        },
      });

      if (existingPayment) {
        const bill = await this.billRepository.findOne({
          where: {
            payment: { id: existingPayment.id },
          },
        });
        console.log(
          `Pago ya registrado para esta deuda OTRO ${bill.serie} ${bill.numero}  ${debt.code}`,
        );
        existingPayment.receipt = receipt;
        await this.paymentRepository.save(existingPayment);
        return bill;
      } else {
        return null;
      }
    }
  }
  private async savePayment(
    debt: any,
    user: any,
    receipt: string,
    createPaidDto: CreatePaidDto,
    datePay: Date,
  ) {
    // const existingPayment = await this.paymentRepository.findOne({
    //   where: {
    //     concept: { id: debt.concept.id },
    //     student: { id: debt.student.id },
    //   },
    //   relations: {
    //     debt: true,
    //   },
    // });

    // if (existingPayment) {
    //   if (debt.concept.id === 2 && existingPayment.debt?.id === debt.id) {
    //     const bill = await this.billRepository.findOne({
    //       where: {
    //         payment: { id: existingPayment.id },
    //       },
    //     });
    //     if (bill) {
    //       console.log(
    //         `Pago ya registrado para esta deuda.${bill.serie} ${bill.numero}  ${debt.code}`,
    //       );
    //     }
    //     existingPayment.receipt = receipt;
    //     return await this.paymentRepository.save(existingPayment);
    //   } else {
    //     const bill = await this.billRepository.findOne({
    //       where: {
    //         payment: { id: existingPayment.id },
    //       },
    //     });
    //     if (bill) {
    //       throw new BadRequestException(
    //         `Pago ya registrado para esta deuda. ${bill}`,
    //       );
    //     }
    //     existingPayment.receipt = receipt;
    //     return await this.paymentRepository.save(existingPayment);
    //   }
    // }

    const pay = this.paymentRepository.create({
      concept: { id: debt.concept.id },
      date: datePay,
      status: true,
      total: debt.total,
      student: { id: debt.student.id },
      user: user.sub,
      paymentMethod: createPaidDto.paymentMethod,
      debt: { id: debt.id },
      receipt,
    });
    return await this.paymentRepository.save(pay);
  }
  /**Crear boleta */
  private async saveBill(
    url: string,
    paymentId: number,
    serie: string,
    numero: number,
  ) {
    const bill = this.billRepository.create({
      date: new Date(),
      url: url,
      payment: { id: paymentId },
      serie,
      numero,
      accepted: false,
    });
    return await this.billRepository.save(bill);
  }

  /**Finalizar Deuda y Matrícula */
  private async finalizeDebtAndEnrollment(debt: any, enrroll: any) {
    debt.status = true;
    enrroll.status = Status.MATRICULADO;
    enrroll.isActive = true;
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

  async createCreditNote(createCreditNoteDto: CreateCreditNoteDto, user: any) {
    const voucher = await this.billRepository.findOne({
      where: {
        id: createCreditNoteDto.voucherId,
      },
      relations: {
        payment: {
          student: {
            family: {
              respAcademic: true,
            },
          },
        },
      },
    });
    if (!voucher) {
      throw new BadRequestException('Dont Exists voucher');
    }
    const existCreditNote = await this.creditNoteRepository.findOne({
      where: {
        bill: { id: voucher.id },
      },
    });
    if (existCreditNote) {
      throw new BadRequestException(' Exists Credit Note');
    }
    const family = voucher.payment.student.family;
    const client = family.respAcademic;

    let numero: number;

    let serie = 'BC01';
    const tipoComprobante = 'NOTA DE CREDITO';
    if (this.env === 'prod') {
      numero = await this.getCorrelative(tipoComprobante, voucher.serie);
    } else {
      serie = 'BBB1';
      numero = await this.getCorrelative('BOLETA', serie);
    }

    const dataCreditNote = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 3,
      serie: serie,
      numero: numero,
      sunat_transaction: 1,
      cliente_tipo_de_documento: 1,
      cliente_numero_de_documento: client.docNumber,
      cliente_denominacion: `${client.name} ${client.lastname} ${client.mLastname}`,
      cliente_direccion: family.address,
      cliente_email: '',
      cliente_email_1: '',
      cliente_email_2: '',
      fecha_de_emision: new Date(),
      fecha_de_vencimiento: '',
      moneda: '1',
      tipo_de_cambio: '',
      porcentaje_de_igv: '18.00',
      descuento_global: '',
      total_descuento: '',
      total_anticipo: '',
      total_gravada: '',
      total_inafecta: '',
      total_exonerada: '',
      total_igv: '',
      total_gratuita: '',
      total_otros_cargos: '',
      total: '',
      percepcion_tipo: '',
      percepcion_base_imponible: '',
      total_percepcion: '',
      total_incluido_percepcion: '',
      detraccion: '',
      observaciones: '',
      documento_que_se_modifica_tipo: 2,
      documento_que_se_modifica_serie: voucher.serie,
      documento_que_se_modifica_numero: voucher.numero,
      tipo_de_nota_de_credito: createCreditNoteDto.creditNoteType,
      tipo_de_nota_de_debito: '',
      enviar_automaticamente_a_la_sunat: 'true',
      enviar_automaticamente_al_cliente: 'false',
      codigo_unico: '',
      condiciones_de_pago: '',
      medio_de_pago: '',
      placa_vehiculo: '',
      orden_compra_servicio: '',
      tabla_personalizada_codigo: '',
      formato_de_pdf: '',
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: voucher.id,
          descripcion: 'Nota Crédito',
          cantidad: 1,
          valor_unitario: '350',
          precio_unitario: '350',
          descuento: '',
          subtotal: '350',
          tipo_de_igv: 9,
          igv: 0.0,
          total: '350',
          anticipo_regularizacion: 'false',
          anticipo_documento_serie: '',
          anticipo_documento_numero: '',
        },
      ],
    };
    try {
      const response = await this.sendToNubefact(dataCreditNote);
      const us = await this.userRepository.findOneBy({
        sub: user.sub,
      });
      const creditNote = this.creditNoteRepository.create({
        creditNoteType: createCreditNoteDto.creditNoteType,
        serie,
        numero,
        date: new Date(),
        url: response.data.enlace_del_pdf,
        accepted: response.data.aceptada_por_sunat,
        bill: { id: voucher.id },
        user: { id: us.id },
      });
      return await this.creditNoteRepository.save(creditNote);
    } catch (error) {
      await this.undoCorrelative(tipoComprobante, serie);
      this.logger.error(
        `[PAID] Error al emitir comprobante: ${error.message} ${serie} ${numero}`,
      );
      throw new HttpException(
        `[PAID] Error al emitir comprobante: ${error.response?.data?.errors || error.message} ${serie} ${numero} `,
        error.response?.status || 500,
      );
    }
  }

  /**getPaid by id and studentId */
  async getBill(studentId: number, conceptId: number) {
    const pay = await this.billRepository.findOne({
      where: {
        payment: {
          student: {
            id: studentId,
          },
          concept: {
            id: conceptId,
          },
        },
      },
      order: {
        id: 'DESC',
      },

      relations: {
        payment: true,
      },
    });

    return pay;
  }

  async getCreditNoteByBill(billId: number) {
    const cn = await this.creditNoteRepository.findOne({
      where: {
        bill: { id: billId },
      },
    });

    return cn;
  }
  /**SCRIPTS */
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

  async generateTxt(bank: PaymentPref) {
    const debts = await this.debtRepository.find({
      where: {
        concept: {
          id: 2,
        },
        status: false,
        student: {
          family: {
            paymentPref: bank,
          },
        },
      },
      relations: {
        student: {
          person: true,
          family: {
            respEconomic: true,
          },
        },
        discount: true,
      },
      order: {
        student: {
          id: 'DESC',
        },
      },
    });

    if (debts.length === 0) {
      throw new BadRequestException('Not data');
    }

    if (bank.toLocaleUpperCase() === PaymentPref.bbva) {
      return this.generateTxtBBVA(debts);
    }

    let total = 0;
    // console.log(this.formatDate(debts[0].createdAt.toString()));
    //**diciembre cambiar a fin de fase regualr vencimiento deuda */
    const details = debts
      .map((d) => {
        let amount: number = d.total;
        if (d.discount !== null) {
          amount = d.total - (d.total * d.discount.percentage) / 100;
          amount = Math.round(amount);
        }
        total += amount;
        if (amount === 0) return null;

        return {
          type: 'DD',
          account: '37508739262',
          studentId: '000000' + d.student.person.docNumber,
          name:
            this.sanitizeText(d.student.person.lastname) +
            ' ' +
            this.sanitizeText(d.student.person.mLastname) +
            ' ' +
            this.sanitizeText(d.student.person.name),
          code: d.code,
          date: this.formatDate(d.createdAt.toISOString()),
          dueDate: this.formatDate(d.dateEnd.toString()),
          amount: amount + '00',
          concept: d.code,
          description: d.description,
        };
      })
      .filter((item) => item !== null);
    /**agregar espacios en blanco nombre 54 */
    /**antes de la RR agregar dos 0 */
    const name = 'ASOCIACION EDUCATIVA LUZ Y CIENCIA';
    const cantRegisters = details.length;
    const header = this.sanitizeText(
      `CC37508739262C${name.padEnd(40)}${this.formatDate(new Date().toString())}${cantRegisters.toString().padStart(9, '0')}${total.toString().padStart(13, '0')}00R`,
    ).padEnd(250, ' ');

    let content = header + '\n';
    const description = 'PENSION';
    /**dinamico nomtos */
    details.forEach((detail) => {
      const name =
        detail.name.length > 40
          ? detail.name.slice(0, 40)
          : detail.name.padEnd(40, ' ');

      const line = `${detail.type}${detail.account}${detail.studentId}${name}${detail.code.padEnd(30)}${detail.date}${detail.dueDate}${detail.amount.padStart(15, '0')}${'0'.repeat(15)}${detail.amount.padStart(9, '0')}${' '}${(description + detail.description).padStart(20, ' ')}00${detail.studentId}`;
      content += line.padEnd(250, ' ') + '\n'; // Asegura que la línea tenga 250 caracteres
    });

    const year = new Date().getFullYear(); // Obtiene el año actual
    const fileName = `CREP${year}.txt`; // Genera el nombre del archivo dinámico
    const filePath = join(__dirname, fileName); // Ruta del archivo
    writeFileSync(filePath, content, { encoding: 'utf-8' });
    return filePath;

    // return debts;
  }

  async generateTxtBBVA(debts: Debt[]) {
    /**HEADER */
    const type = '01';
    const ruc = '20531084587';
    const collection = '000';
    const money = 'PEN';
    const generateDate = this.formatDate(new Date().toString());
    const version = '000';
    const header = this.sanitizeText(
      `${type}${ruc}${collection}${money}${generateDate}${version}${' '.padEnd(7, ' ') + 'T'}`,
    ).padEnd(360, ' ');

    let content = header + '\n';
    const cero = '0';
    /**BODY */
    let total = 0;
    const details = debts
      .map((d) => {
        let amount: number = d.total;
        if (d.discount !== null) {
          amount = d.total - (d.total * d.discount.percentage) / 100;
          amount = Math.round(amount);
        }
        total += amount;
        if (amount === 0) return null;
        return {
          type: '02',
          name:
            this.sanitizeText(d.student.person.lastname) +
            ' ' +
            this.sanitizeText(d.student.person.mLastname) +
            ' ' +
            this.sanitizeText(d.student.person.name),
          studentId: '000' + d.student.person.docNumber,
          description: d.description.slice(0, 3),
          code: d.code,
          period: new Date(d.dateEnd).getMonth() + 1,
          dueDate: this.formatDate(d.dateEnd.toString()),
          amount: amount + '00',
        };
      })
      .filter((item) => item !== null);
    const description = 'PENSION';
    /**dinamico nomtos */
    details.forEach((detail) => {
      const name =
        detail.name.length > 30
          ? detail.name.slice(0, 30)
          : detail.name.padEnd(30, ' ');

      const period = detail.period <= 9 ? '0' + detail.period : detail.period;

      const line = `${detail.type}${name}${(detail.studentId + (description + ' ' + detail.description).padEnd(11) + ' ' + detail.code).padEnd(48, ' ')}${detail.dueDate}${'20301231'}${period}${detail.amount.padStart(15, '0')}${detail.amount.padStart(15, '0')}${cero.padEnd(32, '0')}`;
      content += line.padEnd(360, '') + '\n'; // Asegura que la línea tenga 250 caracteres
    });

    /**FOOTER */

    const typeTotal = '03';
    const cantRegisters = details.length;
    const sumTotal = total + '00';

    // const generateDate = this.formatDate(new Date().toString());
    // const version = '000';
    const footer = this.sanitizeText(
      `${typeTotal}${cantRegisters.toString().padStart(9, '0')}${sumTotal.padStart(18, '0')}${sumTotal.padStart(18, '0')}${cero.padEnd(18, '0')}`,
    ).padEnd(360, ' ');

    content += footer + '\n';

    const year = new Date().getFullYear(); // Obtiene el año actual
    const fileName = `CREP-BBVA${year}.txt`; // Genera el nombre del archivo dinámico
    const filePath = join(__dirname, fileName); // Ruta del archivo
    writeFileSync(filePath, content, { encoding: 'utf-8' });
    return filePath;
  }

  async processTxt(bank: PaymentPref, file: Express.Multer.File, user: any) {
    let results: { code: string; date: string }[] = [];
    let paymentMethod: PaymentMethod;
    let debtsPending: Debt[] = [];
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    if (bank.toLocaleUpperCase() === PaymentPref.bcp) {
      results = await this.processBCP(file);
      paymentMethod = PaymentMethod.bcp;
    } else {
      results = await this.processBBVA(file);
      paymentMethod = PaymentMethod.bbva;
    }

    const debts = await this.debtRepository.find({
      where: {
        code: In(results.map((res) => res.code)),
      },
      relations: {
        student: {
          person: true,
        },
      },
    });

    //**agrupar */
    const groupedBySerie = debts.reduce(
      (acc, debt) => {
        const key = debt.student.id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(debt);
        return acc;
      },
      {} as Record<string, typeof debts>,
    );
    if (debts.length === 0) {
      return {
        status: false,
        message: 'No se encontró información',
        alreadyPaid: debts.map((d) => ({
          code: d.code,
          student:
            d.student.person.lastname +
            ' ' +
            d.student.person.mLastname +
            ' ' +
            d.student.person.name,
        })),
        numberOfRecords: debts.length,
        failedPayments: [],
        successfulPayments: [],
      } as RespProcess;
    }
    const debtsPaid = debts.filter((d) => d.status === true);
    debtsPending = debts.filter((d) => d.status === false);
    const totalDebt = debtsPaid.reduce((sum, deb) => sum + deb.total, 0);
    const totalDebtPending = debtsPending.reduce(
      (sum, deb) => sum + deb.total,
      0,
    );
    if (debtsPaid.length > 0) {
      return {
        status: false,
        message: 'Algunos pagos ya fueron registrados previamente.',
        alreadyPaid: debts.map((d) => ({
          code: d.code,
          student:
            d.student.person.lastname +
            ' ' +
            d.student.person.mLastname +
            ' ' +
            d.student.person.name,
        })),
        debtsPending: debtsPending.map((d) => d.code),
        debtsStudentPending: debtsPending.map((d) => ({
          code: d.code,
          student:
            d.student.person.lastname +
            ' ' +
            d.student.person.mLastname +
            ' ' +
            d.student.person.name,
        })),
        numberOfRecords: debts.length,
        failedPayments: [],
        failLength: 0,
        successfulPayments: [],
        total: totalDebt,
        totalDebtPending,
      } as RespProcess;
    }

    // /**Procesar boletas */
    const resultsOfPay: PromiseSettledResult<any>[] = [];

    for (const [studentId, studentDebts] of Object.entries(groupedBySerie)) {
      // Obtener fechas para cada deuda de este estudiante
      console.log(studentId);
      const obDebts = studentDebts.map((d) => {
        const date = results.find((res) => res.code === d.code);
        return {
          id: d.id,
          datePay: date?.date ?? new Date().toISOString(), // fallback por si no encuentra
        };
      });

      const settledResults = await Promise.allSettled(
        obDebts.map((oD) => {
          return this.createPaid(
            { paymentMethod },
            oD.id,
            user,
            new Date(oD.datePay),
          );
        }),
      );

      resultsOfPay.push(...settledResults);
    }

    debtsPending = await this.debtRepository.find({
      where: {
        code: In(results.map((res) => res.code)),
        status: false,
      },
    });

    const successfulPayments = resultsOfPay
      .filter((res) => res.status === 'fulfilled')
      .map((res) => (res as PromiseFulfilledResult<any>).value);

    const failedPayments = resultsOfPay
      .filter((res) => res.status === 'rejected')
      .map((res) => (res as PromiseRejectedResult).reason);

    const boletas = await this.billRepository.find({
      where: {
        id: In(successfulPayments.map((s) => s.id)),
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
    const result = this.formatDataBill(boletas);
    // Calcular el total de los pagos
    const total = boletas.reduce(
      (sum, boleta) => sum + boleta.payment.total,
      0,
    );
    if (failedPayments.length > 0) {
      return {
        status: false,
        message: 'Algunos pagos no pudieron procesarse.',
        alreadyPaid: [],
        debtsPending: debtsPending.map((d) => d.code),
        debtsStudentPending: debtsPending.map((d) => ({
          code: d.code,
          student:
            d.student.person.lastname +
            ' ' +
            d.student.person.mLastname +
            ' ' +
            d.student.person.name,
        })),
        numberOfRecords: failedPayments.length,
        failedPayments,
        failLength: failedPayments.length,
        successfulPayments: result,
        total,
        totalDebtPending: debtsPending.reduce(
          (sum, boleta) => sum + boleta.total,
          0,
        ),
      } as RespProcess;
    }

    return {
      status: true,
      message: 'Todos los pagos fueron procesados correctamente.',
      alreadyPaid: [],
      numberOfRecords: successfulPayments.length,
      failedPayments,
      failLength: failedPayments.length,
      debtsPending: [],
      successfulPayments: result,
      total,
      totalDebtPending: 0,
    } as RespProcess;
  }

  private async processBCP(file: Express.Multer.File) {
    const results: { code: string; date: string }[] = [];
    const filePath = file.path; // Ruta temporal del archivo
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const linea of rl) {
      if (linea.startsWith('DD')) {
        // Asumiendo que las líneas relevantes empiezan con 'DD'
        const codigo = linea.substring(27, 57).trim(); // Extraer el código
        const rawDate = linea.substring(57, 65); // Substring de la posición 58 a 66 (index 57 a 65)
        const formattedDate = this.formatDateRaw(rawDate);
        results.push({ code: codigo, date: formattedDate });
      }
    }
    fs.unlinkSync(filePath); // Elimina el archivo después de procesarlo

    return results;
  }
  private async processBBVA(file: Express.Multer.File) {
    const results: { code: string; date: string }[] = [];
    const filePath = file.path; // Ruta temporal del archivo
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const linea of rl) {
      if (linea.startsWith('02')) {
        // Asumiendo que las líneas relevantes empiezan con 'DD'
        const codigo = linea.substring(55, 80).trim(); // Extraer el código
        const rawDate = linea.substring(135, 143); // Substring de la posición 58 a 66 (index 57 a 65)

        const formattedDate = this.formatDateRaw(rawDate);
        results.push({ code: codigo, date: formattedDate });
      }
    }
    fs.unlinkSync(filePath); // Elimina el archivo después de procesarlo

    return results;
  }

  async updateDebtCuota() {
    // Obtener los IDs de los estudiantes
    const studentIds = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.studentId')
      .where('payment.conceptId = :conceptId', { conceptId: 3 })
      .andWhere('payment.date BETWEEN :startDate AND :endDate', {
        startDate: '2025-01-18',
        endDate: '2025-01-20',
      })
      .getRawMany();

    const studentIdList = studentIds.map((row) => row.studentId);

    // Obtener el concepto 'C004'
    const conceptCuota = await this.conceptRepository.findOne({
      where: { code: 'C004' },
    });

    if (!conceptCuota) {
      throw new Error('Concepto C004 no encontrado');
    }

    // Crear la fecha de vencimiento
    const dateEnd = new Date();
    dateEnd.setDate(dateEnd.getDate() + 30);

    // Crear deudas en bloque
    const debts = studentIdList.map((studentId) =>
      this.debtRepository.create({
        dateEnd,
        concept: { id: conceptCuota.id },
        student: { id: studentId },
        total: conceptCuota.total,
        status: false,
        description: '',
        code: `CUOTA${studentId}`,
        obs: conceptCuota.description,
      }),
    );

    // Guardar todas las deudas
    await this.debtRepository.save(debts);

    return {
      message: 'Generate successfully',
    };
  }

  formatDate = (dateString?: string): string => {
    if (!dateString) return ''; // Evita errores
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  // Función para limpiar caracteres especiales
  private sanitizeText(text: string): string {
    return text
      .normalize('NFD') // Descompone caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
      .replace(/[Ññ]/g, 'N') // Reemplaza la "Ñ"
      .replace(/['"´`¨]/g, '') // Elimina apóstrofes, comillas y diéresis
      .replace(/[^A-Z0-9 ]/g, '') // Solo permite letras, números y espacios
      .toUpperCase(); // Convierte todo a mayúsculas
  }

  private formatDateRaw(yyyymmdd: string): string {
    const year = parseInt(yyyymmdd.substring(0, 4), 10);
    const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1; // Mes en base 0
    const day = parseInt(yyyymmdd.substring(6, 8), 10);

    const date = new Date(year, month, day);
    date.setDate(date.getDate() + 1); // Sumamos un día

    return date.toISOString().split('T')[0]; // Retorna en formato YYYY-MM-DD
  }

  private formatDataBill(boletas: Bill[]) {
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
        description: `${boleta.payment.concept.description.toUpperCase()} - ${student.name} ${student.lastname} ${student.mLastname} - ${grade.name} - ${level.name} - ${campus.name}`,
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
          paymentMethod: boleta.payment.paymentMethod,
          dateSendNubefact: boleta.payment.createdAt,
        },
      };
    });

    return result;
  }

  /**DISCUONT */

  async createDiscount(createDiscountDto: CreateDiscountDto, debtId: number) {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
    });

    if (!debt) {
      throw new NotFoundException('No existe la deuda');
    }

    const { percentage, reason } = createDiscountDto;

    const discountToCreate = this.discountsRepository.create({
      debt: debt,
      percentage,
      reason,
    });

    const newDiscount = await this.discountsRepository.save(discountToCreate);

    return newDiscount;
  }

  async updateDiscount(createDiscountDto: CreateDiscountDto, id: number) {
    const discount = await this.discountsRepository.findOne({
      where: { id: id },
    });

    if (!discount) {
      throw new NotFoundException('No existe el descuento');
    }

    const { percentage, reason } = createDiscountDto;

    discount.percentage = percentage;
    discount.reason = reason;

    const discountUpdated = await this.discountsRepository.save(discount);

    return discountUpdated;
  }

  async generatePdf() {
    const width = 7;
    const height = 25;
    const tradeName = 'COLEGIO ALBERT EISTEIN';
    const socialReason = 'COLEGIO ALBERT EISTEIN';
    const department = 'Ancash';
    const district = 'Independencia';
    const province = 'Huaraz';
    const ruc = '12392932921';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'cm',
      format: [width, height],
    });

    const nameCompany = tradeName.toUpperCase();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(nameCompany, (width - doc.getTextWidth(nameCompany)) / 2, 0.5);

    doc.setFontSize(8);
    const splitName = doc.splitTextToSize(socialReason.toUpperCase(), 6);
    doc.text(splitName, 3.5, 0.9, {
      align: 'center',
    });

    let y = 2;
    doc.setFont('helvetica', 'normal');
    const splitAddress = doc.splitTextToSize('Direccion prueba', 6);
    doc.text(splitAddress, 3.5, y, { align: 'center' });

    y += 1;
    doc.text(
      `${department.toUpperCase()} - ${province.toUpperCase()} - ${district.toUpperCase()}`,
      (width -
        doc.getTextWidth(
          `${department[0].toUpperCase()} - ${province.toUpperCase()} - ${district.toUpperCase()}`,
        )) /
        2,
      y,
    );

    y += 0.4;
    doc.text(`RUC ${ruc}`, (width - doc.getTextWidth(`RUC ${ruc}`)) / 2, y);

    y += 0.6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `BOLETA ELECTRÓNICA ${'BB11'}-1`,
      (width -
        doc.getTextWidth(
          `BOLETA ELECTRÓNICA  BB11'
            }-1`,
        )) /
        2,
      y,
    );

    y += 0.5;
    doc.text('CLIENTE', 0.3, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    y += 0.4;
    doc.text(`DNI:`, 0.3, y);
    doc.setFont('helvetica', 'normal');
    doc.text('51443343', doc.getTextWidth(`DNI`) + 0.4, y);

    y += 0.4;
    doc.setFont('helvetica', 'bold');
    doc.text('NOMBRE:', 0.3, y);
    doc.setFont('helvetica', 'normal');
    doc.text('CArlos p', doc.getTextWidth('NOMBRE:') + 0.4, y);

    y += 0.4;
    doc.setFont('helvetica', 'bold');
    doc.text('DIR.:', 0.3, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Mi direccion', doc.getTextWidth('DIR.:') + 0.4, y);

    y += 0.4;
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE EMISIÓN:', 0.3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(
      this.formatDate(new Date().toString()).replace(/-/g, '/'),
      doc.getTextWidth('FECHA DE EMISION:') + 0.4,
      y,
    );

    y += 0.4;
    doc.setLineWidth(0.01);
    doc.line(0.3, y, width - 0.3, y);

    y += 0.4;
    doc.setFont('helvetica', 'bold');
    doc.text('PENSION', 0.3, y);

    y += 0.4;
    doc.setFont('helvetica', 'normal');
    doc.text('item de prueba', 0.3, y);
    y += 0.4;
    doc.text(`descripcion`, 0.3, y);

    y += 0.4;
    doc.text(`mas descripcion`, 0.3, y);

    y += 0.4;
    doc.text(`Nombre del estudiante`.trim().toUpperCase(), 0.3, y);

    y += 0.4;
    doc.setLineWidth(0.01);
    doc.line(0.3, y, width - 0.3, y);

    y += 0.4;
    doc.setFont('helvetica', 'bold');
    doc.text('CUOTA N°', 0.3, y);
    doc.text('F.VEN:', 2.5, y);
    doc.text('MONTO', 4.5, y);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    y += 0.4;

    doc.text(`cuota`, 0.8, y);
    doc.text(`${this.formatDate(new Date().toString())}`, 2.5, y);
    doc.text(`s/. 0.00`, 4.5, y);
    y += 0.8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INAFECTA', 2.5, y);
    doc.text(`s/. 0.00`, 4.5, y);

    y += 0.4;
    doc.text('GRABADA', 2.5, y);
    doc.text(`s/. 0.00`, 4.5, y);

    y += 0.4;
    doc.text('IGV', 2.5, y);
    doc.text(`s/. 0.00`, 4.5, y);

    y += 0.4;
    doc.text('TOTAL', 2.5, y);
    doc.text(`s/. 0.00`, 4.5, y);

    doc.setLineWidth(0.01);
    doc.line(0.3, y, width - 0.3, y);

    y += 0.4;
    const splitText = doc.splitTextToSize(
      'REPRESENTACIÓN IMPRESA DE LA BOLETA ELECTRÓNICA',
      7,
      {
        wordWrap: true,
      },
    );

    doc.text(splitText, 3.5, y, {
      align: 'center',
    });

    y += 0.8;
    doc.setFont('helvetica', 'normal');
    doc.text(
      doc.splitTextToSize(
        `Si tiene algún problema con esta boleta, envíe un correo electrónico a orellanop`,
        5,
        {
          wordWrap: true,
        },
      ),
      3.5,
      y,
      {
        align: 'center',
      },
    );

    y += 1;
    const qr = await qrcode.toDataURL(
      `/validar/boleta-escaneada/type=B&payment=&installment=$`,
      {
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
        },
      },
    );
    doc.addImage(qr, 'JPG', 1.5, y, width - 3, width - 3);

    y += 4.3;
    doc.text(
      doc.splitTextToSize('Emitido desde www.colegioae.edu.pe', 7, {
        wordWrap: true,
      }),
      3.5,
      y,
      {
        align: 'center',
      },
    );
    doc.save('output.pdf');
    const pdfArray = doc.output('arraybuffer');
    return Buffer.from(pdfArray);
  }
}
