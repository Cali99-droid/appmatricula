import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { CreateTreasuryDto } from './dto/create-treasury.dto';
import { UpdateTreasuryDto } from './dto/update-treasury.dto';

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post()
  create(@Body() createTreasuryDto: CreateTreasuryDto) {
    return this.treasuryService.create(createTreasuryDto);
  }

  @Get()
  findAll() {
    return this.treasuryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treasuryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTreasuryDto: UpdateTreasuryDto) {
    return this.treasuryService.update(+id, updateTreasuryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treasuryService.remove(+id);
  }
}
