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
  Query,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePersonCrmDto } from './dto/create-person-crm.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SearchByDateDto } from 'src/common/dto/search-by-date.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { AdvancedSearchDto, SearchableRole } from './dto/advanced-search.dto';
import { Person } from './entities/person.entity';
@ApiTags('Person')
@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get('advanced-search') // <--- MOVIDO AQUÍ, ANTES DE :id
  @ApiOperation({
    summary: 'Realizar una búsqueda avanzada de personas',
    description:
      'Busca estudiantes o padres de familia por un término que puede ser DNI, email, nombre completo o teléfono.',
  })
  @ApiQuery({
    name: 'term',
    required: true,
    description: 'Término de búsqueda (DNI, email, nombre, etc.).',
    type: String,
    example: 'Ana García',
  })
  @ApiQuery({
    name: 'role',
    required: true,
    description: 'El rol de la persona a buscar.',
    enum: SearchableRole,
    example: SearchableRole.STUDENT,
  })
  @ApiResponse({
    status: 200,
    description:
      'Búsqueda exitosa. Retorna un arreglo de personas que coinciden.',
    type: [Person],
  })
  @ApiResponse({
    status: 400,
    description:
      'Error de validación. El término o el rol no cumplen con los requisitos.',
  })
  advancedSearch(@Query() advancedSearchDto: AdvancedSearchDto) {
    return this.personService.advancedSearch(advancedSearchDto);
  }

  @Get('crm/created')
  findToCreateInCRM() {
    return this.personService.findToCreateInCRM();
  }

  @Get('crm/updated')
  findTUpdateInCRM() {
    return this.personService.findToUpdateInCRM();
  }

  @Get('parents/get-sons')
  searchSons(@AuthenticatedUser() user: any) {
    return this.personService.findStudentsByParents(user);
  }

  @Get('parents/profile')
  getProfileUser(@GetUser() user: User) {
    return this.personService.findProfileUser(user);
  }
  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
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

  @Get('parents/attendance-student/:id')
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'StartDate of the attendace',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'EndDate of the attendace',
    type: String,
  })
  findAttendanceByStudent(
    @Param('id') id: string,
    @Query() searchByDateDto: SearchByDateDto,
  ) {
    return this.personService.findAttendanceByStudent(+id, searchByDateDto);
  }
}
