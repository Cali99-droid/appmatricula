import { Person } from 'src/person/entities/person.entity';
import { Status } from '../enum/status.enum';

export interface StudentEnrollment {
  person: Person;
  status: Status;
}
