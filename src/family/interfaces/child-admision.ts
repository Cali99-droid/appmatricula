import { VacantAdmision } from './vacant-admision';

export interface ChildAdmision {
  id: number;
  name: string;
  lastname: string;
  mLastname: string;
  doc_number: string;
  birthdate: Date;
  gender: string;
  type_doc: string;
  grade: number;
  level: number;
  schoolId: number;
  district_id: string;
  doc: string;
  validate: number;
  validateSchool: number;
  vacant: VacantAdmision;
}
