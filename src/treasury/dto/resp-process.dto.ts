import { ApiProperty } from '@nestjs/swagger';

export class numberOfRecords {
  @ApiProperty({
    example: true,
    description: 'Indica si el proceso fue exitoso o no',
  })
  status: boolean;

  @ApiProperty({
    example: 'Proceso completado correctamente',
    description: 'Mensaje de respuesta',
  })
  message: string;

  @ApiProperty({
    example: ['PEN2MARZO20251S1699', 'PEN2MARZO20251S1700'],
    description: 'Lista de códigos de deuda ya pagados previamente',
  })
  alreadyPaid: string[];

  @ApiProperty({ example: 12, description: 'Numero de registros procesados' })
  numberOfRecords: number;

  @ApiProperty({
    example: [{ debtId: 123, reason: 'Fondos insuficientes' }],
    description: 'Lista de pagos fallidos con sus razones',
    type: 'array',
    items: { type: 'object' },
  })
  failedPayments: any[];

  @ApiProperty({
    example: [{ debtId: 456, receipt: 'B001-123456' }],
    description: 'Lista de pagos exitosos con su comprobante',
    type: 'array',
    items: { type: 'object' },
  })
  successfulPayments: any[];
}
