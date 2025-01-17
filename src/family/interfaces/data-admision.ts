import { ChildAdmision } from './child-admision';
import { ParentAdmision } from './parent-admision';

export interface DataAdmision {
  child: ChildAdmision;
  parents: ParentAdmision[];
}
