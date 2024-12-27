import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { CreateTreasuryDto } from './dto/create-treasury.dto';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Resource, Roles } from 'nest-keycloak-connect';

@ApiTags('Treasury')
@Resource('appcolegioae')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post('payment/:debtId')
  @ApiResponse({ status: 201, description: 'pagado' })
  createPaid(
    @Body() createTreasuryDto: CreateTreasuryDto,
    @Param('debtId') debtId: number,
  ) {
    return this.treasuryService.createPaid(createTreasuryDto, debtId);
  }

  @Get('debts/:studentId')
  @ApiResponse({ status: 201, description: 'deudas del alumno' })
  @Roles({
    roles: ['administrador-colegio', 'secretaria', 'padre-colegio'],
  })
  findDebts(@Param('studentId') studentId: number) {
    return this.treasuryService.findDebts(+studentId);
  }
}
