import { Controller, Get, Post, Body, Param, Res, Query } from '@nestjs/common';
import { TreasuryService } from './treasury.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Resource, Roles } from 'nest-keycloak-connect';
import { CreatePaidDto } from './dto/create-paid.dto';
import { FindPaidDto } from './dto/find-paid.dto';
import { Response } from 'express';

@ApiTags('Treasury')
@Resource('appcolegioae')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post('payment/:debtId')
  @ApiResponse({ status: 201, description: 'pagado' })
  createPaid(
    @Body() createTreasuryDto: CreatePaidDto,
    @Param('debtId') debtId: number,
    @AuthenticatedUser() user: any,
    @Res() res: Response,
  ) {
    return this.treasuryService.createPaid(
      createTreasuryDto,
      debtId,
      user,
      res,
    );
  }

  @Get('debts/:studentId')
  @ApiResponse({ status: 201, description: 'deudas del alumno' })
  @Roles({
    roles: ['administrador-colegio', 'secretaria', 'padre-colegio'],
  })
  findDebts(@Param('studentId') studentId: number) {
    return this.treasuryService.findDebts(+studentId);
  }

  @Get('payment')
  @ApiResponse({ status: 201, description: 'datos de boletas' })
  getPaid(@Query() findPaidDto: FindPaidDto, @AuthenticatedUser() user: any) {
    const { startDate, endDate } = findPaidDto;
    return this.treasuryService.findPaid(user, startDate, endDate);
  }
}
