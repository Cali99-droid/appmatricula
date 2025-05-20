export class ActivityCourseResponseDto {
  id: number;
  forAllClassrooms: boolean;
  active: boolean;
  course: {
    id: number;
    name: string;
    area: {
      id: number;
      name: string;
    };
  };
  //   periodo: {
  //     id: number;
  //     nombre: string;
  //   };
  activityClassroom: {
    id: number;
    section: string;
  }[];
  competencies: {
    id: number;
    name: string;
  }[];
}
