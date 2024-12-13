import { Injectable } from '@nestjs/common';
import { CreateDebtorsHelperDto } from './dto/create-debtors_helper.dto';
import { UpdateDebtorsHelperDto } from './dto/update-debtors_helper.dto';

@Injectable()
export class DebtorsHelperService {
  create(createDebtorsHelperDto: CreateDebtorsHelperDto) {
    return 'This action adds a new debtorsHelper';
  }

  findAll() {
    return `This action returns all debtorsHelper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debtorsHelper`;
  }

  update(id: number, updateDebtorsHelperDto: UpdateDebtorsHelperDto) {
    return `This action updates a #${id} debtorsHelper`;
  }

  remove(id: number) {
    return `This action removes a #${id} debtorsHelper`;
  }
}
