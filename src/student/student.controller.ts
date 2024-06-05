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
}
