import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DebtorsHelperService } from './debtors_helper.service';
import { DataDebTorsArrayDto } from './dto/data-debtors-array.dto';
import { UpdateDebtorsHelperDto } from './dto/update-debtors_helper.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('DebTors Helper')
@Controller('debtors-helper')
export class DebtorsHelperController {
  constructor(private readonly debtorsHelperService: DebtorsHelperService) {}

  @Post()
  create(@Body() dataDebTorsArrayDto: DataDebTorsArrayDto) {
    return this.debtorsHelperService.create(dataDebTorsArrayDto);
  }

  @Get()
  findAll() {
    return this.debtorsHelperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtorsHelperService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDebtorsHelperDto: UpdateDebtorsHelperDto,
  ) {
    return this.debtorsHelperService.update(+id, updateDebtorsHelperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtorsHelperService.remove(+id);
  }
}
