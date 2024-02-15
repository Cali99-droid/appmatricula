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
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { YearsService } from 'src/years/years.service';
import { LevelService } from 'src/level/level.service';
import { CampusXLevelService } from 'src/campus_x_level/campus_x_level.service';
import { UpdateCampusAndlevelDto } from './dto/update-campusAndLevel.dto';
@ApiTags('Campus')
@Controller('campus')
export class CampusController {
  constructor(
    private readonly campusService: CampusService,
    private readonly campusDetailService: CampusDetailService,
    private readonly yearService: YearsService,
    private readonly campusXlevelService: CampusXLevelService,
    private readonly levelService: LevelService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Campus was created', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or CampusDetailId and YearId for campus ',
  })
  async create(@Body() createCampusDto: CreateCampusDto, @Res() res: Response) {
    const { levelId, ...rest } = createCampusDto;
    let levelIdNotFound = null;
    const existCampus = await this.campusService.validateCampusExists(
      rest.campusDetailId,
      rest.yearId,
    );
    if (existCampus)
      return res.status(400).json({
        message: 'Duplicate CampusDetailId and YearId for campus',
        error: 'Bad Request',
        statusCode: 400,
      });
    for (const idLevel of levelId) {
      const existLevel = await this.levelService.exist(idLevel);
      if (!existLevel) {
        levelIdNotFound = idLevel;
        break;
      }
    }
    if (levelIdNotFound !== null) {
      return res.status(400).json({
        message: `LevelId: ${levelIdNotFound} incorrect and/or not exist`,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    const campus = await this.campusService.create(createCampusDto);
    levelId.forEach(async (levelId) => {
      await this.campusXlevelService.create({
        campusId: campus.id,
        levelId: levelId,
      });
    });
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

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el id ',
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
    @Body() updateCampusDto: UpdateCampusAndlevelDto,
    @Res() res: Response,
  ) {
    const { campusXlevelId, ...rest } = updateCampusDto;
    let levelIdNotFound = null;
    let campusXlevelNotFound = null;
    const existCampus = await this.campusService.validateCampusExists(
      rest.campusDetailId,
      rest.yearId,
    );
    if (existCampus && existCampus.id != +id)
      return res.status(400).json({
        message: 'Duplicate CampusDetailId and YearId for campus',
        error: 'Bad Request',
        statusCode: 400,
      });
    for (const campsuXlevel of campusXlevelId) {
      const { levelId } = campsuXlevel;
      const existLevel = await this.levelService.exist(levelId);
      if (!existLevel) {
        levelIdNotFound = levelId;
        break;
      }
      const existCampusXlvl =
        await this.campusXlevelService.validateCampusXlevelExists(+id, levelId);
      if (existCampusXlvl && existCampusXlvl.id != campsuXlevel.id) {
        campusXlevelNotFound = levelId;
        break;
      }
    }
    if (levelIdNotFound !== null) {
      return res.status(400).json({
        message: `LevelId: ${levelIdNotFound} incorrect and/or not exist`,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    if (campusXlevelNotFound !== null) {
      return res.status(400).json({
        message: `LevelId: ${campusXlevelNotFound} exist`,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    const campus = await this.campusService.update(+id, rest);

    campusXlevelId.forEach(async (campusxlevel) => {
      if (campusxlevel.id) {
        await this.campusXlevelService.update(campusxlevel.id, {
          campusId: campus.id,
          levelId: campusxlevel.levelId,
        });
      } else {
        await this.campusXlevelService.create({
          campusId: campus.id,
          levelId: campusxlevel.levelId,
        });
      }
    });
    return res.status(200).json({
      status: 200,
      description: 'Campus was created',
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Campus was deleted' })
  @ApiResponse({
    status: 404,
    description: 'campus  not found ',
  })
  remove(@Param('id') id: string) {
    return this.campusService.remove(+id);
  }
}
