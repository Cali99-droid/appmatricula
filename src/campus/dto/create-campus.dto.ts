import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsInt, Min } from 'class-validator';
export class CreateCampusDto {
  @ApiProperty({
    description: 'Name of the year (unique)',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  name: string;
  @ApiProperty({
    description: 'UgelLocalCode of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  ugelLocalCode: string;
  @ApiProperty({
    description: 'Classrooms of the campus',
    type: Number,
  })
  @IsNotEmpty({ message: 'ClassRooms cannot be empty' })
  @IsInt({ message: 'ClassRooms has to be number' })
  @Min(0, { message: 'ClassRooms cannot be less than 0' })
  classRooms: number;
  @ApiProperty({
    description: 'Country of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  country: string;
  @ApiProperty({
    description: 'Departamnt of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  departamnt: string;
  @ApiProperty({
    description: 'Province of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  province: string;
  @ApiProperty({
    description: 'District of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  district: string;
  @ApiProperty({
    description: 'Address of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  address: string;
  @ApiProperty({
    description: 'Cellphone of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  cellphone: string;
  @ApiProperty({
    description: 'Email of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  email: string;
  @ApiProperty({
    description: 'WebPage of the campus',
    nullable: false,
    minLength: 4,
  })
  @IsString()
  @MinLength(2)
  webPage: string;
}
