import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  Put,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
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
import { FileInterceptor } from '@nestjs/platform-express';

import { Express } from 'express';
import { RespProcess } from './interfaces/RespProcess.interface';
import { numberOfRecords } from './dto/resp-process.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
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

  /**DESCUENTOS */
  @Post('discount/:debtId')
  @ApiResponse({ status: 201, description: 'descuento aplicado' })
  @Roles({
    roles: ['administrador-colegio', 'secretaria'],
  })
  createDiscount(
    @Body() createDiscountDto: CreateDiscountDto,
    @Param('debtId') debtId: number,
    // @AuthenticatedUser() user: any,
  ) {
    return this.treasuryService.createDiscount(createDiscountDto, debtId);
  }

  @Patch(':debtId/discount')
  updateDiscount(
    @Body() createDiscountDto: CreateDiscountDto,
    @Param('debtId', ParseIntPipe) id: number,
  ) {
    return this.treasuryService.updateDiscount(createDiscountDto, id);
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
  @Post('process-txt/:bank')
  @ApiResponse({
    status: 201,
    description: 'information of operation',
    type: numberOfRecords,
  })
  @UseInterceptors(FileInterceptor('file'))
  async processTxt(
    @UploadedFile() file: Express.Multer.File,
    @Param('bank') bank: PaymentPref,
    @AuthenticatedUser() user: any,
  ) {
    return (await this.treasuryService.processTxt(
      bank,
      file,
      user,
    )) as RespProcess;
  }

  @Get('generar/boleta')
  @ApiResponse({
    status: 201,
    description: 'information of operation',
    type: numberOfRecords,
  })
  @Public()
  async generatePdf(@Res() res: Response) {
    const pdfBuffer = await this.treasuryService.generatePdf();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=boleta.pdf',
    });

    res.send(pdfBuffer);
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
