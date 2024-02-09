import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  // Delete,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@ApiTags('Level')
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  async create(@Body() data: CreateGradeDto, @Res() res: Response) {
    try {
      data.name = data.name.toUpperCase();
      const existLevel = await this.gradeService.exists({
        name: data.name,
      });
      if (existLevel) {
        return res.status(409).json({
          statusCode: 409,
          error: 'Módulo no creado',
          message: 'Este modulo ya existe',
        });
      }
      await this.gradeService.create(data);
      return res.status(200).json({
        statusCode: 200,
        message: 'Grado creado',
      });
    } catch (error) {}
    return res.status(500).json({
      statusCode: 500,
      error: 'Módulo no creado',
      message: 'Error interno al crear el modulo',
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const data = await this.gradeService.findAll();

      return res.status(200).json({
        statusCode: 200,
        message: 'Grados encontrados',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        error: 'Grados no encontrados',
        message: 'Error interno al buscar los Grados',
        data: error,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const data = await this.gradeService.findOne({
        id,
      });

      if (!data)
        return res.status(404).json({
          statusCode: 404,
          error: 'Grado no encontrado',
          message: 'Id incorrecto y/o no existe',
        });

      return res.status(200).json({
        statusCode: 200,
        message: 'Grado encontrado',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        error: 'Módulo no encontrado',
        message: 'Error interno al buscar el modulo',
        data: error,
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateGradeDto,
    @Res() res: Response,
  ) {
    try {
      const levelExist = await this.gradeService.exists({ id });

      if (!levelExist)
        return res.status(404).json({
          statusCode: 404,
          error: 'Grado no actualizado',
          message: 'Id incorrecto y/o no existe',
        });
      data.name = data.name.toUpperCase();
      await this.gradeService.update(id, data);
      return res.status(200).json({
        statusCode: 200,
        message: 'Grado actualizado',
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        error: 'Módulo no actualizado',
        message: 'Error interno al actualizar el modulo',
        data: error,
      });
    }
  }
}
