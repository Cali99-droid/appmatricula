export interface StudentData {
  id: number;
  lastname: string;
  mLastname: string;
  name: string;
  attendance: Attendance[];
}
export interface Attendance {
  id: number;
  arrivalDate: Date;
  condition: string;
}
