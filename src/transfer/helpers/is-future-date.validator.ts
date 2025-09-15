import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(scheduledDateTime: Date, args: ValidationArguments) {
    // Comprueba si la fecha es en el futuro (la hora actual es menor que la fecha de agendamiento)
    return scheduledDateTime.getTime() > new Date().getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha de agendamiento no puede ser en el pasado.';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
