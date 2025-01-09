import { Controller, Get, Post, Body, Param, Res, Query } from '@nestjs/common';
import { TreasuryService } from './treasury.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Resource, Roles } from 'nest-keycloak-connect';
import { CreatePaidDto } from './dto/create-paid.dto';
import { FindPaidDto } from './dto/find-paid.dto';
// import { Response } from 'express';

@ApiTags('Treasury')
@Resource('client-test-appae')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post('payment/:debtId')
  @ApiResponse({ status: 201, description: 'pagado' })
  createPaid(
    @Body() createTreasuryDto: CreatePaidDto,
    @Param('debtId') debtId: number,
    @AuthenticatedUser() user: any,
  ) {
    return this.treasuryService.createPaid(createTreasuryDto, debtId, user);
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
    const { startDate, endDate, userId } = findPaidDto;
    return this.treasuryService.findPaid(user, startDate, endDate, +userId);
  }

  @Get('statistics')
  @ApiResponse({ status: 201, description: 'Statistics' })
  getStatistics() {
    return this.treasuryService.getStatistics();
  }

  // @Get('migrate')
  // @ApiResponse({ status: 201, description: 'datos de boletas' })
  // migrateToNubeFact() {
  //   return this.treasuryService.migrateToNubeFact();
  // }
}
