import {
  IsInt,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

class CompetencyCourseDto {
  @IsInt()
  id: number;
}

export class CreateActivityCourseDto {
  @IsInt()
  courseId: number;

  //   @IsInt()
  //   periodoId: number;

  @IsBoolean()
  forAllGrades: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetencyCourseDto)
  competencies: CompetencyCourseDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  grades?: number[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
