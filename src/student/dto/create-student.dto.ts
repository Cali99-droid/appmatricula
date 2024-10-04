import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    example: '11134487800020',
    description: 'Code of the Student',
    nullable: true,
    minLength: 4,
  })
  @IsOptional()
  @IsString()
  studentCode: string;

  @ApiProperty({
    example: '00000177',
    description: 'Code of the Student',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  code: string;

  @ApiProperty({
    example: '1718294289603.webp',
    description: 'Photo of the Student',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  photo: string;

  @ApiProperty({
    example: 'true',
    description: 'Status of the Student',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  status: boolean;

  @ApiProperty({
    example: 1,
    description: 'id of the person student',
    nullable: false,
  })
  @IsNumber()
  personId: number;

  @ApiProperty({
    example: 1,
    description: 'id of the family student',
    nullable: true,
  })
  @IsNumber()
  familyId: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'Reponsability Enrollment of the Student',
  // })
  // @IsString()
  // @IsOptional()
  // respEnrollment?: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'Reponsability Economic of the Student',
  // })
  // @IsString()
  // @IsOptional()
  // respEconomic?: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'Reponsability Academic of the Student',
  // })
  // @IsString()
  // @IsOptional()
  // respAcademic?: number;
}
