import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateTreasuryDto } from './dto/create-treasury.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { Repository } from 'typeorm';
import { Family } from 'src/family/entities/family.entity';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { Bill } from './entities/bill.entity';

@Injectable()
export class TreasuryService {
  private readonly apiUrl =
    'https://api.nubefact.com/api/v1/58874885-716a-4d06-9e92-46b3c6b1a439'; // Reemplaza con el URL de tu cuenta NUBEFACT
  private readonly apiToken =
    '0f5d1d4c483d493a8ad63f8aade67e24e8bbf7c11340444da2eb9056ab41d381'; // Reemplaza con tu token de acceso
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
  ) {}

  async createPaid(createTreasuryDto: CreateTreasuryDto, debtId: number) {
    const debt = await this.debtRepository.findOne({
      where: {
        id: debtId,
      },
      relations: {
        concept: true,
        student: true,
      },
    });
    const family = await this.familyRepository.findOne({
      where: {
        student: { id: debt.student.id },
      },
      relations: {
        respEconomic: true,
      },
    });
    const client = family.respEconomic;
    const igv = (debt.total / 1.18) * 0.18;
    const boletaData = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: 2, // 2: Boleta
      serie: 'BBB1', // Cambia según tu configuración
      numero: 1, // Número correlativo de la boleta
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
      porcentaje_de_igv: 18,
      total_gravada: debt.total - igv,
      total_igv: igv,
      total: debt.total,
      observaciones: 'Gracias por su compra.',
      items: [
        {
          unidad_de_medida: 'NIU',
          codigo: debt.concept.code,
          descripcion: debt.concept.description,
          cantidad: 1,
          valor_unitario: debt.total - igv,
          precio_unitario: debt.total,
          descuento: '',
          subtotal: debt.total - igv,
          tipo_de_igv: 1,
          igv: igv,
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
      });
      const newPay = await this.paymentRepository.save(pay);
      const bill = this.billRepository.create({
        date: new Date(),
        url: response.data.enlace_del_pdf,
        payment: { id: newPay.id },
        serie: response.data.enlace_del_pdf,
      });
      const newBill = await this.billRepository.save(bill);
      return newBill;

      debt.status = true;
      await this.debtRepository.save(debt);
    } catch (error) {
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
      },
    });

    const debts = await this.debtRepository.find({
      where: {
        student: { id: studentId },
      },
      relations: {
        concept: true,
      },
    });
    const data = {
      debts: debts,
      resp: family.respEconomic,
    };
    return data;
  }
}
