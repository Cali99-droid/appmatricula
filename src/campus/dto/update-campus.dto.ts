// import { ApiProperty } from '@nestjs/swagger';
// import { IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCampusDto } from './create-campus.dto';
export class UpdateCampusDto extends PartialType(CreateCampusDto) {}
// export class UpdateCampusDto {
//   @ApiProperty({
//     example: 1,
//     description: 'id of the campusDetail',
//     nullable: false,
//   })
//   @IsNumber()
//   campusDetailId: number;
//   @ApiProperty({
//     example: 1,
//     description: 'id of the year',
//     nullable: false,
//   })
//   @IsNumber()
//   yearId: number;

//   @ApiProperty({
//     example: 1,
//     description: 'IDs of the levels',
//     nullable: false,
//   })
//   @IsNumber({}, { each: true })
//   levelId: number;
// }
