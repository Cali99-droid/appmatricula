import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEndTimeAfterStartTime', async: false })
export class IsEndTimeAfterStartTimeConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const startTime = (args.object as any).startTime;
    const endTime = value;

    if (!startTime || !endTime) {
      return false; // Si falta startTime o endTime, la validación falla
    }

    // Compara las horas de startTime y endTime
    const startTimeParts = startTime.split(':').map(Number);
    const endTimeParts = endTime.split(':').map(Number);

    // Si las horas son iguales, compara los minutos
    if (startTimeParts[0] === endTimeParts[0]) {
      return startTimeParts[1] < endTimeParts[1]; // endTime debe ser mayor que startTime
    }

    return startTimeParts[0] < endTimeParts[0]; // endTime debe ser mayor que startTime
  }

  defaultMessage() {
    return 'endTime must be after startTime';
  }
}
