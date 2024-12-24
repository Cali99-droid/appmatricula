import { Injectable } from '@nestjs/common';
import { CreateTreasuryDto } from './dto/create-treasury.dto';
import { UpdateTreasuryDto } from './dto/update-treasury.dto';

@Injectable()
export class TreasuryService {
  create(createTreasuryDto: CreateTreasuryDto) {
    return 'This action adds a new treasury';
  }

  findAll() {
    return `This action returns all treasury`;
  }

  findOne(id: number) {
    return `This action returns a #${id} treasury`;
  }

  update(id: number, updateTreasuryDto: UpdateTreasuryDto) {
    return `This action updates a #${id} treasury`;
  }

  remove(id: number) {
    return `This action removes a #${id} treasury`;
  }
}
