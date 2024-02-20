import { registerDecorator, ValidationOptions } from 'class-validator';
import { ExistIdConstraint } from './exist-id-constraint';

export type ExistIdConstraintInput = {
  tableName: string;
  isArray?: boolean;
};

export function ExistId(
  options: ExistIdConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'exist-id',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: ExistIdConstraint,
    });
  };
}
