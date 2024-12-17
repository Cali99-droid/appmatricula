import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { Campus } from './entities/campus.entity';

import { UpdateCampusDto } from './dto/update-campus.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
@ApiTags('Campus')
@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Campus was created', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or CampusDetailId and YearId for campus ',
  })
  async create(@Body() createCampusDto: CreateCampusDto, @Res() res: Response) {
    const existCampus = await this.campusService.validateCampusExists(
      createCampusDto.campusDetailId,
      createCampusDto.yearId,
    );
    if (existCampus)
      return res.status(400).json({
        message: 'Duplicate CampusDetailId and YearId for campus',
        error: 'Bad Request',
        statusCode: 400,
      });

    await this.campusService.create(createCampusDto);
    return res.status(200).json({
      status: 200,
      description: 'Campus was created',
    });
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of campus',
    type: [Campus],
  })
  findAll() {
    return this.campusService.findAll();
  }
  @Get('year/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar campus específico, puedes enviar el id del año ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail campus', type: Campus })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  // @Auth()
  async findAllByYear(@Param('id') id: string, @GetUser() user: any) {
    return this.campusService.findAllByYear(+id, user);
  }
  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar campus específico, puedes enviar el id ',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail campus', type: Campus })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  async findOne(@Param('id') id: string) {
    return this.campusService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Campus was updated', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campus ',
  })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCampusDto: UpdateCampusDto,
    @Res() res: Response,
  ) {
    const existCampus = await this.campusService.validateCampusExists(
      updateCampusDto.campusDetailId,
      updateCampusDto.yearId,
    );
    if (existCampus && existCampus.id != +id)
      return res.status(400).json({
        message: 'Duplicate CampusDetailId and YearId for campus',
        error: 'Bad Request',
        statusCode: 400,
      });
    await this.campusService.update(+id, updateCampusDto);
    return res.status(200).json({
      status: 200,
      description: 'Campus was updated',
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Campus was deleted' })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.campusService.remove(+id);
    return res.status(200).json({
      status: 200,
      description: 'Campus was deleted',
    });
  }
}
