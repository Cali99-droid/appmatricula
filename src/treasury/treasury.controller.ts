import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TreasuryService } from './treasury.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Resource, Roles } from 'nest-keycloak-connect';
import { CreatePaidDto } from './dto/create-paid.dto';

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
}
