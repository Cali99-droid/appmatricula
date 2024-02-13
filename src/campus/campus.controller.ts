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
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
import { CampusDetailService } from 'src/campus_detail/campus_detail.service';
import { YearsService } from 'src/years/years.service';
import { LevelService } from 'src/level/level.service';
@ApiTags('Campus')
@Controller('campus')
export class CampusController {
  constructor(
    private readonly campusService: CampusService,
    private readonly campusDetailService: CampusDetailService,
    private readonly yearService: YearsService,
    private readonly levelService: LevelService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Campus was created', type: Campus })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name or ugelLocalCode for campus ',
  })
  async create(@Body() createCampusDto: CreateCampusDto, @Res() res: Response) {
    const { levelId, ...rest } = createCampusDto;
    const existcampus = await this.campusDetailService.exist(
      rest.campusDetailId,
    );
    if (!existcampus)
      return res.status(404).json({
        status: 404,
        description: `campusDetailId: ${rest.campusDetailId} incorrect and/or not exist`,
      });
    const existyear = await this.yearService.exist(rest.yearId);
    if (!existyear)
      return res.status(404).json({
        status: 404,
        description: `yearId: ${rest.yearId} incorrect and/or not exist`,
      });
    let levelIdNotFound = null;
    let campusAlreadyExists = null;

    for (const idLevel of levelId) {
      const existLevel = await this.levelService.exist(idLevel);
      if (!existLevel) {
        levelIdNotFound = idLevel;
        break;
      }

      const existCampus = await this.campusService.validateCampusExists(
        rest.campusDetailId,
        idLevel,
        rest.yearId,
      );
      if (existCampus) {
        campusAlreadyExists = idLevel;
        break;
      }
    }
    if (levelIdNotFound !== null) {
      return res.status(404).json({
        status: 404,
        description: `levelId: ${levelIdNotFound} incorrect and/or not exist`,
      });
    }
    if (campusAlreadyExists !== null) {
      return res.status(404).json({
        status: 404,
        description: `campusId: ${rest.campusDetailId},levelId: ${campusAlreadyExists},yearId: ${rest.yearId}, already exist`,
      });
    }
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

  @Get(':idCampusDetail/:idYear')
  @ApiParam({
    name: 'idCampusDetail',
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
  async findOne(
    // @Query('idCampusDetail') idcampusDetail: string,
    // @Query('idYear') idYear: string,
    @Param('idCampusDetail') idcampusDetail: string,
    @Param('idYear') idYear: string,
  ) {
    const yearId = await this.campusService.findOneByCampusandYear(
      +idcampusDetail,
      +idYear,
    );
    console.log(yearId);
    const campusDetail =
      await this.campusDetailService.findOneByCampusDetailandYear(
        +idcampusDetail,
        +idYear,
      );
    const campusWithFirstYearId = {
      ...campusDetail,
      yearId: yearId.id,
    };
    return campusWithFirstYearId;
  }

  @Patch('/')
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
    // @Param('id') id: string,
    @Body() updateCampusDto: UpdateCampusDto,
    @Res() res: Response,
  ) {
    const { campusDetailId, yearId } = updateCampusDto;
    const existcampus = await this.campusDetailService.exist(campusDetailId);
    if (!existcampus)
      return res.status(404).json({
        status: 404,
        description: `campusDetailId: ${campusDetailId} incorrect and/or not exist`,
      });
    const existyear = await this.yearService.exist(yearId);
    if (!existyear)
      return res.status(404).json({
        status: 404,
        description: `yearId: ${yearId} incorrect and/or not exist`,
      });
    await this.campusService.update(updateCampusDto);
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
  remove(@Param('id') id: string) {
    return this.campusService.remove(+id);
  }
}
