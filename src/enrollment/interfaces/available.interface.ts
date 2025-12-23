export interface AvailableClassroom {
  id: number;
  name: string;
  vacants: number;
  suggested: boolean;
  campus: string;
  level: string;
}

export interface VacantsClassrooms {
  id: number;
  gradeId: number;
  grade: string;
  section: string;
  level: string;
  capacity: number;
  previousEnrolls: number;
  currentEnrroll: number;
  totalPreRegistered: number;
  reserved?: number;
  onProcess?: number;
  vacants: number;
  inOthers: number;
  hasVacants: boolean;
  type: string;
  detailOrigin: DetailOrigin;
}

export interface DetailOrigin {
  id: number;
  grade: string;
  section: string;
  enrrolls: number;
}
