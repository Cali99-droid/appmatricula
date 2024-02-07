import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDateBefore',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          // console.log(new Date(value));
          // // console.log(new Date(relatedValue));

          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            new Date(value) > new Date(relatedValue)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be before ${args.constraints[0]}`;
        },
      },
    });
  };
}
