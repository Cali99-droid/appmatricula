import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MinLength, ValidateNested } from 'class-validator';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export class CreateFamilyParentsStudentDto {
  @ApiProperty({
    description: 'Name Family of the family',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  nameFamily: string;

  @ApiProperty({
    description: 'data of the person parent one',
    nullable: false,
  })
  @ValidateNested()
  @Type(() => CreatePersonDto) // Indica el tipo de la clase anidada
  parentOne: CreatePersonDto;
  // parentOne: {
  //   typeDoc: TypeDoc;
  //   docNumber: string;
  //   name: string;
  //   lastName: string;
  //   mLastName: string;
  //   gender: Gender;
  //   familyRole: Gender;
  // };
  @ApiProperty({
    description: 'data of the person parent two',
    nullable: false,
  })
  @ValidateNested()
  @Type(() => CreatePersonDto)
  parentTwo: CreatePersonDto;

  @ApiProperty({
    description: 'data of the person parent two',
    nullable: false,
  })
  @ValidateNested()
  @Type(() => CreatePersonDto)
  student: CreatePersonDto;
}
