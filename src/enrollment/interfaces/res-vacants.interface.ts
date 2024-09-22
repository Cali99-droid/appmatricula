export interface Vacants {
  grade: string;
  level: string;
  capacity: number;
  ratified: number;
  enrollments: number;
  vacant: number;
  sections: Section[];
}

export interface Section {
  section: string;
  capacity: number;
  ratified: number;
  enrollments: number;
  vacant: number;
}
