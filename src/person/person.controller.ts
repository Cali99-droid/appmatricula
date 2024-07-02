import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePersonCrmDto } from './dto/create-person-crm.dto';
@ApiTags('Person')
@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }
  // @Get(':studentId')
  // findOneStudent(@Param('studentId') studentId: string) {
  //   return this.personService.findOneStudent(+studentId);
  // }

  // @Get('parents/:studentCode')
  // findParentsByStudentCode(@Param('studentCode') studentCode: string) {
  //   return this.personService.findParentsByStudentCode(studentCode);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personService.update(+id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(+id);
  }

  @Post('photo/:id')
  @ApiResponse({
    status: 201,
    description: 'File was uploaded',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 }
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    await this.personService.uploadPhoto(file.originalname, file.buffer, +id);
  }
  @Post('crm')
  createByCrm(@Body() createPersonCrmDto: CreatePersonCrmDto) {
    return this.personService.createParentCRM(createPersonCrmDto);
  }
  @Get('crm/created')
  findToCreateInCRM() {
    return this.personService.findToCreateInCRM();
  }
  @Get('crm/updated')
  findTUpdateInCRM() {
    return this.personService.findToUpdateInCRM();
  }
}
