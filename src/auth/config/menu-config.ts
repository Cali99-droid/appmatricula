export const AdminMenu = {
  mainMenu: [
    {
      id: 1,
      label: 'Dashboard',
      link: '/admin/dashboard',
      icon: 'dashboard',
      tagSubMenu: false,
      permissions: ['dashboard'],
      subMenu: [],
    },
    {
      id: 2,
      label: 'Matricula',
      link: '/admin/school',
      icon: 'school',
      tagSubMenu: true,
      permissions: ['matricula'],
      subMenu: [
        {
          id: 1,
          label: 'Familias',
          icon: 'family',
          link: '/admin/school/families',
          permissions: ['matricula-families'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Cambio seccion',
          icon: 'family',
          link: '/admin/school/changeStudent',
          permissions: ['matricula-cambio-seccion'],
          subMenu: [],
        },
        {
          id: 3,
          label: 'Reportes',
          icon: 'reportSearch',
          link: '/admin/school/families',
          permissions: ['matricula-reports'],
          subMenu: [
            {
              id: 1,
              label: 'Vacantes',
              icon: 'work',
              link: '/admin/school/vacants',
              permissions: ['vacantes'],
              subMenu: [],
            },
            {
              id: 2,
              label: 'Datos de comunicación',
              icon: 'comunication',
              link: '/admin/staff/activity-users',
              permissions: ['datos-comunicacion'],
              subMenu: [],
            },
            {
              id: 3,
              label: 'Matrícula en proceso',
              icon: 'process',
              link: '/admin/reports/report-status',
              permissions: ['matricula-en-proceso'],
              subMenu: [],
            },
            {
              id: 4,
              label: 'Estudiantes por sección',
              icon: 'seccionStudent',
              link: '/admin/school/studentReport',
              permissions: ['estudiantes-seccion'],
              subMenu: [],
            },
          ],
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
          subMenu: [],
        },
        {
          id: 2,
          label: 'Estudiantes',
          icon: 'student',
          link: '/admin/student/students',
          permissions: ['generador-carnet'],
          subMenu: [],
        },
        {
          id: 3,
          label: 'horario Personal',
          icon: 'horarioPersonal',
          link: '/admin/student/daysadditional',
          permissions: ['personalizar-horario'],
          subMenu: [],
        },
        {
          id: 4,
          label: 'Control Asistencia',
          icon: 'asistencia',
          link: '/admin/student/attendance',
          permissions: ['registro-asistencia'],
          subMenu: [],
        },
      ],
    },
    {
      id: 3,
      label: 'Reportes',
      link: '/admin/reports',
      icon: 'report',
      tagSubMenu: true,
      permissions: ['reporte'],
      subMenu: [
        {
          id: 1,
          label: 'Reportes Estudiantes',
          icon: 'tableStudents',
          link: '/admin/reports/students',
          permissions: ['reporte-asistencia-estudiante'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Reporte Global',
          icon: 'reportGlobal',
          link: '/admin/reports/report',
          permissions: ['reporte-asistencia-global'],
          subMenu: [],
        },
        {
          id: 3,
          label: 'Reporte por sede',
          icon: 'reportSede',
          link: '/admin/reports/report-campus',
          permissions: ['reporte-asistencia-sede'],
          subMenu: [],
        },
      ],
    },
    {
      id: 4,
      label: 'Usuarios',
      link: '/admin/users',
      icon: 'users',
      tagSubMenu: true,
      permissions: ['users'],
      subMenu: [
        {
          id: 1,
          label: 'Usuarios',
          icon: 'userAdd',
          link: '/admin/staff/users',
          permissions: ['users'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Roles',
          icon: 'userRol',
          link: '/admin/staff/roles',
          permissions: ['administrador-colegio'],
          subMenu: [],
        },
      ],
    },
    {
      id: 5,
      label: 'Comunicaciones',
      link: '/admin/emails',
      icon: 'comunication',
      tagSubMenu: true,
      permissions: ['comunicacion'],
      subMenu: [
        {
          id: 1,
          label: 'Correos',
          icon: 'email',
          link: '/admin/emails',
          permissions: ['comunicacion-emails'],
          subMenu: [],
        },
      ],
    },
    {
      id: 6,
      label: 'Administración',
      link: '/admin/staff/user-behavior',
      icon: 'administration',
      tagSubMenu: true,
      permissions: ['administracion'],
      subMenu: [
        {
          id: 1,
          label: 'Comportamiento',
          icon: 'userComportamiento',
          link: '/admin/staff/user-behavior',
          permissions: ['administracion-gestion-comportamiento'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Usuarios Deudores',
          icon: 'userDeudores',
          link: '/admin/staff/user-debots',
          permissions: ['administracion-gestion-deudas'],
          subMenu: [],
        },
      ],
    },
    {
      id: 7,
      label: 'Tesoreria',
      link: '/admin/treasury/registerStudent',
      icon: 'tesoreria',
      tagSubMenu: true,
      permissions: ['tesoreria'],
      subMenu: [
        {
          id: 1,
          label: 'Pagos',
          icon: 'payment',
          link: '/admin/treasury/registerStudent',
          permissions: ['tesoreria-pagos'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Pagos Reserva',
          icon: 'reserverPayment',
          link: '/admin/school/search-stundet',
          permissions: ['tesoreria-reserva'],
          subMenu: [],
        },
        {
          id: 3,
          label: 'Reporte de Pagos',
          icon: 'reportPayment',
          link: '/admin/treasury/payments',
          permissions: ['tesoreria-reporte'],
          subMenu: [],
        },
        {
          id: 4,
          label: 'Bancos',
          link: '/admin/treasury',
          icon: 'bank',
          tagSubMenu: true,
          permissions: ['administracion'],
          subMenu: [
            {
              id: 1,
              label: 'Genrar TXT',
              icon: 'userComportamiento',
              link: 'download',
              permissions: ['tesoreria-reporte'],
              subMenu: [],
            },
            {
              id: 2,
              label: 'Procesas TXT',
              icon: 'upload',
              link: '/admin/treasury/process-payment',
              permissions: ['tesoreria-reporte'],
              subMenu: [],
            },
          ],
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
      permissions: ['configuracion'],
      subMenu: [
        {
          id: 1,
          label: 'Años',
          icon: 'module',
          link: '/admin/configuration/years',
          permissions: ['configuracion-años'],
          subMenu: [],
        },
        {
          id: 2,
          label: 'Fases',
          icon: 'module',
          link: '/admin/configuration/phase',
          permissions: ['configuracion-fases'],
          subMenu: [],
        },
        {
          id: 3,
          label: 'Sedes',
          icon: 'module',
          link: '/admin/configuration/campus',
          permissions: ['configuracion-sedes'],
          subMenu: [],
        },
        {
          id: 4,
          label: 'Niveles',
          icon: 'module',
          link: '/admin/configuration/level',
          permissions: ['configuracion-niveles'],
          subMenu: [],
        },
        {
          id: 5,
          label: 'Grados',
          icon: 'module',
          link: '/admin/configuration/grade',
          permissions: ['configuracion-grados'],
          subMenu: [],
        },
        {
          id: 6,
          label: 'Relacion',
          icon: 'module',
          link: '/admin/configuration/campus-relation',
          permissions: ['configuracion-relacion'],
          subMenu: [],
        },
        {
          id: 7,
          label: 'Turnos',
          icon: 'module',
          link: '/admin/configuration/school-shifts',
          permissions: ['configuracion-turnos'],
          subMenu: [],
        },
        {
          id: 8,
          label: 'Salones',
          icon: 'module',
          link: '/admin/school/classroom',
          permissions: ['configuracion-salones'],
          subMenu: [],
        },
        {
          id: 9,
          label: 'Aulas',
          icon: 'module',
          link: '/admin/configuration/activity-classroom',
          permissions: ['configuracion-aulas'],
          subMenu: [],
        },
        {
          id: 10,
          label: 'Dias Laborables',
          icon: 'module',
          link: '/admin/student/dayofweek',
          permissions: ['configuracion-dias'],
          subMenu: [],
        },
        {
          id: 10,
          label: 'Cronograma',
          icon: 'module',
          link: '/admin/enrollment/schedule',
          permissions: ['configuracion-cronograma'],
          subMenu: [],
        },
      ],
    },
  ],
};
