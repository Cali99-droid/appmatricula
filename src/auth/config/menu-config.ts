export const AdminMenu = {
  mainMenu: [
    {
      id: 1,
      label: 'Dashboard',
      link: '/admin/dashboard',
      icon: 'dashboard',
      tagSubMenu: false,
      permissions: ['administrador-colegio'],
      subMenu: [],
    },
    {
      id: 2,
      label: 'Matricula',
      link: '/admin/school',
      icon: 'school',
      tagSubMenu: true,
      permissions: ['administrador-colegio', 'secretaria'],
      subMenu: [
        {
          id: 1,
          label: 'Est. por seccion',
          icon: 'table',
          link: '/admin/school/matricula',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 2,
          label: 'Parentesco',
          icon: 'family',
          link: '/admin/school/family',
          permissions: ['administrador-colegio'],
        },
        {
          id: 3,
          label: 'Familias',
          icon: 'family',
          link: '/admin/school/families',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 4,
          label: 'Vacantes',
          icon: 'family',
          link: '/admin/school/vacants',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 5,
          label: 'Datos de comunicación',
          icon: 'user',
          link: '/admin/staff/activity-users',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 6,
          label: 'Matrícula en proceso',
          icon: 'user',
          link: '/admin/reports/report-status',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 7,
          label: 'Estudiantes por sección',
          icon: 'user',
          link: '/admin/school/search-student',
          permissions: ['administrador-colegio', 'secretaria'],
        },
      ],
    },
    {
      id: 3,
      label: 'Asistencia',
      link: '/admin/Prueba',
      icon: 'student',
      tagSubMenu: true,
      permissions: [
        'generador-carnet',
        'registro-asistencia',
        'modificar-feriados',
        'personalizar-horario',
      ],
      subMenu: [
        {
          id: 1,
          label: 'Día festivo',
          icon: 'calendar',
          link: '/admin/student/holiday',
          permissions: ['modificar-feriados'],
        },
        {
          id: 2,
          label: 'Estudiantes',
          icon: 'student',
          link: '/admin/student/students',
          permissions: ['generador-carnet'],
        },
        {
          id: 3,
          label: 'Hr. Personalizado',
          icon: 'student',
          link: '/admin/student/daysadditional',
          permissions: ['personalizar-horario'],
        },
        {
          id: 4,
          label: 'Control Asistencia',
          icon: 'student',
          link: '/admin/student/attendance',
          permissions: ['registro-asistencia'],
        },
      ],
    },
    {
      id: 3,
      label: 'Reportes',
      link: '/admin/reports',
      icon: 'report',
      tagSubMenu: true,
      permissions: ['obtener-reportes', 'obtener-reporte-estudiantes'],
      subMenu: [
        {
          id: 1,
          label: 'Reportes Estudiantes',
          icon: 'tableStudents',
          link: '/admin/reports/students',
          permissions: ['obtener-reportes', 'obtener-reporte-estudiantes'],
        },
        {
          id: 2,
          label: 'Reporte Global',
          icon: 'reports',
          link: '/admin/reports/report',
          permissions: ['administrador-colegio'],
        },
        {
          id: 3,
          label: 'Reporte por sede',
          icon: 'reports',
          link: '/admin/reports/report-campus',
          permissions: ['obtener-reportes'],
        },
      ],
    },
    {
      id: 4,
      label: 'Usuarios',
      link: '/admin/users',
      icon: 'users',
      tagSubMenu: true,
      permissions: ['administrador-colegio', 'secretaria'],
      subMenu: [
        {
          id: 1,
          label: 'Usuarios',
          icon: 'userAdd',
          link: '/admin/staff/users',
          permissions: ['administrador-colegio'],
        },
        {
          id: 2,
          label: 'Roles',
          icon: 'userAdd',
          link: '/admin/staff/roles',
          permissions: ['administrador-colegio'],
        },
        {
          id: 3,
          label: 'Comportamiento',
          icon: 'user',
          link: '/admin/staff/user-behavior',
          permissions: ['administrador-colegio'],
        },
        {
          id: 5,
          label: 'Usuarios Deudores',
          icon: 'user',
          link: '/admin/staff/user-debots',
          permissions: ['administrador-colegio'],
        },
      ],
    },
    {
      id: 5,
      label: 'Comunicaciones',
      link: '/admin/emails',
      icon: 'comunication',
      tagSubMenu: true,
      permissions: ['administrador-colegio'],
      subMenu: [
        {
          id: 1,
          label: 'Correos',
          icon: 'email',
          link: '/admin/emails',
          permissions: ['administrador-colegio'],
        },
      ],
    },
    {
      id: 6,
      label: 'Administración',
      link: '/admin/staff/user-behavior',
      icon: 'comunication',
      tagSubMenu: true,
      permissions: ['secretaria'],
      subMenu: [
        {
          id: 1,
          label: 'Comportamiento',
          icon: 'user',
          link: '/admin/staff/user-behavior',
          permissions: ['secretaria'],
        },
      ],
    },
    {
      id: 7,
      label: 'Tesoreria',
      link: '/admin/treasury/registerStudent',
      icon: 'comunication',
      tagSubMenu: true,
      permissions: ['administrador-colegio', 'secretaria'],
      subMenu: [
        {
          id: 1,
          label: 'Pagos',
          icon: 'email',
          link: '/admin/treasury/registerStudent',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 2,
          label: 'Pagos Reserva',
          icon: 'email',
          link: '/admin/school/search-stundet',
          permissions: ['administrador-colegio', 'secretaria'],
        },
        {
          id: 3,
          label: 'Reporte de Pagos',
          icon: 'email',
          link: '/admin/treasury/payments',
          permissions: ['administrador-colegio', 'secretaria'],
        },
      ],
    },
  ],
  settingsMenu: [
    {
      id: 1,
      label: 'Configuración',
      link: '/admin/dashboard',
      icon: 'setting',
      tagSubMenu: true,
      permissions: ['administrador-colegio'],
      subMenu: [
        {
          id: 1,
          label: 'Años',
          icon: 'module',
          link: '/admin/configuration/years',
          permissions: ['administrador-colegio'],
        },
        {
          id: 2,
          label: 'Fases',
          icon: 'module',
          link: '/admin/configuration/phase',
          permissions: ['administrador-colegio'],
        },
        {
          id: 3,
          label: 'Campus',
          icon: 'module',
          link: '/admin/configuration/campus',
          permissions: ['administrador-colegio'],
        },
        {
          id: 4,
          label: 'Niveles',
          icon: 'module',
          link: '/admin/configuration/level',
          permissions: ['administrador-colegio'],
        },
        {
          id: 5,
          label: 'Grados',
          icon: 'module',
          link: '/admin/configuration/grade',
          permissions: ['administrador-colegio'],
        },
        {
          id: 6,
          label: 'Relacion',
          icon: 'module',
          link: '/admin/configuration/campus-relation',
          permissions: ['administrador-colegio'],
        },
        {
          id: 7,
          label: 'Turnos',
          icon: 'module',
          link: '/admin/configuration/school-shifts',
          permissions: ['administrador-colegio'],
        },
        {
          id: 8,
          label: 'Salones',
          icon: 'module',
          link: '/admin/school/classroom',
          permissions: ['administrador-colegio'],
        },
        {
          id: 9,
          label: 'Aulas',
          icon: 'module',
          link: '/admin/configuration/activity-classroom',
          permissions: ['administrador-colegio'],
        },
        {
          id: 10,
          label: 'Dias Laborables',
          icon: 'module',
          link: '/admin/student/dayofweek',
          permissions: ['administrador-colegio'],
        },
        {
          id: 10,
          label: 'Cronograma',
          icon: 'module',
          link: '/admin/enrollment/schedule',
          permissions: ['administrador-colegio'],
        },
      ],
    },
  ],
};
