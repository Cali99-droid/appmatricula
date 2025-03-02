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
  Put,
  Query,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateBehaviorDto } from 'src/enrollment/dto/update-behavior.dto';
import { UpdateAllowNextRegistrationDto } from 'src/enrollment/dto/update-allowNextRegistration.dto';
import { SearchEstudiantesDto } from './dto/search-student.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@ApiTags('Student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }
  @Get('/search')
  findStudents(
    @Query() searchDto: SearchEstudiantesDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.studentService.findStudents(searchDto, user);
  }
  @Get('autocomplete')
  findAllAutocomplete(@Query('value') value: string) {
    return this.studentService.findAutocomplete(value);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }
  @Get('update/codes')
  updateCodes() {
    return this.studentService.updateStudentCodes();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }

  @Put('photo/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload student photo to AWS S3' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    // type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'student not found ',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id del estudiante a actualizar foto',
    type: String,
  })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    return await this.studentService.uploadPhoto(
      file.originalname,
      file.buffer,
      +id,
    );
  }
  @Get('activity-classroom-debtors/:activityClassroomId/:hasDebt')
  @ApiOperation({
    summary: 'get debtors by ActivityClassroom',
  })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  findByActivityClassroom(
    @Param('activityClassroomId') activityClassroomId: number,
    @Param('hasDebt') hasDebt: boolean,
  ) {
    return this.studentService.findByActivityClassroomDebTors(
      +activityClassroomId,
      hasDebt,
    );
  }

  @Get('activity-classroom-behavior/:activityClassroomId')
  @ApiOperation({
    summary: 'get behavior by ActivityClassroom',
  })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  findByActivityClassroomBehavior(
    @Param('activityClassroomId') activityClassroomId: number,
  ) {
    return this.studentService.findByActivityClassroomBehavior(
      +activityClassroomId,
    );
  }

  @Get('behavior/:id')
  @ApiOperation({
    summary: 'get one behavior ',
  })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  getOneBehavior(@Param('id') id: number) {
    return this.studentService.findOneBehavior(+id);
  }

  @Patch('behavior/:id')
  updateBehavior(
    @Param('id') id: string,
    @Body() updateBehaviorDto: UpdateBehaviorDto,
  ) {
    return this.studentService.updateBehavior(+id, updateBehaviorDto);
  }

  @Get('behaviorDetails/:id')
  @ApiOperation({
    summary: 'get one behaviorDetails ',
  })
  @ApiResponse({
    status: 400,
    description: 'some data sending is bad ',
  })
  getOneCommitmentDocumentURL(@Param('id') id: number) {
    return this.studentService.findOneCommitmentDocumentURL(+id);
  }

  @Patch('behaviorDetails/:id')
  updateCommitmentDocumentURL(
    @Param('id') id: string,
    @Body() updateAllowNextRegistrationDto: UpdateAllowNextRegistrationDto,
  ) {
    return this.studentService.updateAllowNextRegistration(
      +id,
      updateAllowNextRegistrationDto,
    );
  }

  @Put('pdf/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload pdf pdf to AWS S3' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    // type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'student not found ',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id de subir foto',
    type: String,
  })
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    return await this.studentService.uploadPDF(file.buffer, +id);
  }
}
