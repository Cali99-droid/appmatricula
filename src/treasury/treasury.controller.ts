import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { TreasuryService } from './treasury.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUser,
  Public,
  Resource,
  Roles,
} from 'nest-keycloak-connect';
import { CreatePaidDto } from './dto/create-paid.dto';
import { FindPaidDto } from './dto/find-paid.dto';
import { CreatePaidReserved } from './dto/create-paid-reserved.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { Response } from 'express';
import { PaymentPref } from 'src/family/enum/payment-pref.enum';
import { createReadStream } from 'fs';

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
  @Post('payment-reserved')
  @ApiResponse({ status: 201, description: 'pagado' })
  createPaidReserved(
    @Body() createPaidReservedDto: CreatePaidReserved,
    @AuthenticatedUser() user: any,
  ) {
    return this.treasuryService.createPaidReserved(createPaidReservedDto, user);
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
  @Post('credit-note')
  @ApiResponse({ status: 201, description: 'Statistics' })
  createCreditNote(
    @Body() createCreditNoteDto: CreateCreditNoteDto,
    @AuthenticatedUser() user: any,
  ) {
    return this.treasuryService.createCreditNote(createCreditNoteDto, user);
  }

  @Get('generate-txt/:bank')
  @ApiResponse({ status: 201, description: 'Arch txt' })
  @Public()
  async downloadTxt(@Res() res: Response, @Param('bank') bank: PaymentPref) {
    const filePath = await this.treasuryService.generateTxt(bank);

    const year = new Date().getFullYear();
    const fileName = `CREP-${bank.toLocaleUpperCase()}${year}.txt`;

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  // @Get('migrate')
  // @ApiResponse({ status: 201, description: 'datos de boletas' })
  // migrateToNubeFact() {
  //   return this.treasuryService.migrateToNubeFact();
  // }

  // @Get('update-debt')
  // @ApiResponse({ status: 201, description: 'datos de boletas' })
  // migrateToNubeFact() {
  //   return this.treasuryService.updateDebtCuota();
  // }
}
