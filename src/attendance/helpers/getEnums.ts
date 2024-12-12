import { ConditionAttendance } from '../enum/condition.enum';
import { Shift } from '../enum/shift.enum';

export function getShift(shift: Shift): string {
  if (shift === Shift.Afternoon) {
    return 'Tarde';
  }
  if (shift === Shift.Extra) {
    return 'Extra';
  }
  if (shift === Shift.Morning) {
    return 'Mañana';
  }
}

export function getCondition(condition: ConditionAttendance): string {
  if (condition === ConditionAttendance.Absent) {
    return 'Falta';
  }
  if (condition === ConditionAttendance.Early) {
    return 'Temprano';
  }
  if (condition === ConditionAttendance.Late) {
    return 'Tarde';
  }
}
