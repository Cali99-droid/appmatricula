import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/person/enum/gender.enum';
import { Status } from '../enum/status.enum';

class StudentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  mLastname: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  docNumber: string;
}

class ClassroomDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  grade: string;

  @ApiProperty()
  level: string;
}

export class ResponseEnrrollDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: Status })
  status: Status;

  @ApiProperty({ type: StudentDto })
  student: StudentDto;

  @ApiProperty({ type: ClassroomDto })
  classroom: ClassroomDto;
}
