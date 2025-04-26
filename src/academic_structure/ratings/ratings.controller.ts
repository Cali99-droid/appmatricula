import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRatingsDto } from './dto/create-ratings.dto';
import { UpdateRatingsDto } from './dto/update-ratings.dto';
import { Ratings } from './entities/ratings.entity';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { RatingsService } from './ratings.service';
@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Ratings was created',
    type: Ratings,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for ratings ',
  })
  create(
    @Body() createRatingsDto: CreateRatingsDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.ratingsService.create(createRatingsDto, user);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Array of ratings',
    type: [Ratings],
  })
  findAll(@Query('activityClassRoomId') activityClassRoomId: string) {
    return this.ratingsService.findAll(+activityClassRoomId);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description:
      'El término de búsqueda utilizado para encontrar grados específicos, puedes enviar el solo el id',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Detail ratings', type: Ratings })
  @ApiResponse({
    status: 404,
    description: 'ratings  not found ',
  })
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Ratings was updated',
    type: Ratings,
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate name for ratings',
  })
  @ApiResponse({
    status: 404,
    description: 'ratings  not found ',
  })
  update(
    @Param('id') id: string,
    @Body() updateRatingsDto: UpdateRatingsDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.ratingsService.update(+id, updateRatingsDto, user);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Ratings was deleted' })
  @ApiResponse({
    status: 404,
    description: 'ratings  not found ',
  })
  remove(@Param('id') id: string) {
    return this.ratingsService.remove(+id);
  }
}
