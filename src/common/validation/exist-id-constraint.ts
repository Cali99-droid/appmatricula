import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ExistIdConstraintInput } from './exist-id';
import { EntityManager } from 'typeorm';

@ValidatorConstraint({ name: 'existId', async: true })
@Injectable()
export class ExistIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const input: ExistIdConstraintInput = args.constraints[0];
    const { tableName, isArray = false } = input;
    if (!value) {
      return false;
    }
    // Directly return true for empty arrays to accept them as valid
    if (isArray && Array.isArray(value) && value.length === 0) {
      return true;
    }

    if (isArray && value.length > 0) {
      const count = await this.entityManager
        .getRepository(tableName)
        .createQueryBuilder(tableName)
        .where('id IN (:...ids)', { ids: value })
        .getCount();

      return count === value.length;
    } else if (!isArray) {
      const result = await this.entityManager
        .getRepository(tableName)
        .createQueryBuilder(tableName)
        .where('id = :id', { id: value })
        .getOne();

      return Boolean(result);
    }
    // Returns false if value is not an array when isArray is true or if any other unexpected condition occurs
    return false;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `Some value of ${validationArguments.property} does not exist.`;
  }
}
