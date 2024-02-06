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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@ApiTags('Level')
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  async create(@Body() data: CreateLevelDto, @Res() res: Response) {
    try {
      data.name = data.name.toUpperCase();
      const existLevel = await this.levelService.exists({
        name: data.name,
      });
      if (existLevel) {
        return res.status(409).json({
          statusCode: 409,
          error: 'Módulo no creado',
          message: 'Este modulo ya existe',
        });
      }
      await this.levelService.create(data);
      return res.status(200).json({
        statusCode: 200,
        message: 'Nivel creado',
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
      const data = await this.levelService.findAll();

      return res.status(200).json({
        statusCode: 200,
        message: 'Niveles encontrados',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        error: 'Niveles no encontrados',
        message: 'Error interno al buscar las Niveles',
        data: error,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const data = await this.levelService.findOne({
        id,
      });

      if (!data)
        return res.status(404).json({
          statusCode: 404,
          error: 'Nivel no encontrado',
          message: 'Id incorrecto y/o no existe',
        });

      return res.status(200).json({
        statusCode: 200,
        message: 'Nivel encontrado',
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
    @Body() data: UpdateLevelDto,
    @Res() res: Response,
  ) {
    try {
      const levelExist = await this.levelService.exists({ id });

      if (!levelExist)
        return res.status(404).json({
          statusCode: 404,
          error: 'Nivel no actualizado',
          message: 'Id incorrecto y/o no existe',
        });
      data.name = data.name.toUpperCase();
      await this.levelService.update(id, data);
      return res.status(200).json({
        statusCode: 200,
        message: 'Nivel actualizado',
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

  // @Delete(':id')
  // async delete(@Param('id') id: number, @Res() res: Response) {
  //   const levelExist = await this.levelService.exists({ id });

  //   if (!levelExist)
  //     return res.status(404).json({
  //       statusCode: 404,
  //       error: 'Nivel no eliminada',
  //       message: 'Id incorrecto y/o no existe',
  //     });

  //   await this.categoriesService.delete(id);
  // }
}
