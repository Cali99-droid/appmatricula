import { ApiProperty } from '@nestjs/swagger';

export class CourseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'PLÁSTICAS Y MÚSICA' })
  name: string;
}

export class TeacherAssignmentResponseDto {
  @ApiProperty({ example: 169 })
  id: number;

  @ApiProperty({ example: false })
  isTutor: boolean;

  @ApiProperty({
    example: 'SPECIFIC_COURSE',
    enum: ['COMPLETE_AREA', 'SPECIFIC_COURSE'],
  })
  typeAssignment: string;

  @ApiProperty({ example: 'ARTE Y CULTURA' })
  area: string;

  @ApiProperty({ example: 'REGULAR' })
  phase: string;

  @ApiProperty({ example: 122 })
  activityClassroomId: number;

  @ApiProperty({ example: 9 })
  gradeId: number;

  @ApiProperty({ example: '6to grado' })
  grade: string;

  @ApiProperty({ example: '6to grado B' })
  activityClassroom: string;

  @ApiProperty({ example: 'Primaria' })
  level: string;

  @ApiProperty({ example: 1 })
  campusId: number;

  @ApiProperty({ example: 'Sede 1' })
  campus: string;

  @ApiProperty({ type: CourseDto })
  course: CourseDto;
}
