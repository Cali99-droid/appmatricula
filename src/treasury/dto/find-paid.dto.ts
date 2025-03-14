import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class FindPaidDto {
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio debe estar en formato de fecha válido (YYYY-MM-DD).',
    },
  )
  startDate: string;

  @IsNotEmpty({ message: 'La fecha de final es obligatoria.' })
  @IsDateString(
    {},
    {
      message:
        'La fecha de final debe estar en formato de fecha válido (YYYY-MM-DD).',
    },
  )
  endDate: string;

  @IsOptional()
  userId: number;
}
