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
import { CreateDebtorsHelperDto } from './dto/create-debtors_helper.dto';
import { UpdateDebtorsHelperDto } from './dto/update-debtors_helper.dto';

@Controller('debtors-helper')
export class DebtorsHelperController {
  constructor(private readonly debtorsHelperService: DebtorsHelperService) {}

  @Post()
  create(@Body() createDebtorsHelperDto: CreateDebtorsHelperDto) {
    return this.debtorsHelperService.create(createDebtorsHelperDto);
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
