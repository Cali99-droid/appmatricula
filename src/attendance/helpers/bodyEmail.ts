import { Shift } from '../enum/shift.enum';
import { ConditionAttendance } from '../enum/condition.enum';
import * as moment from 'moment-timezone';
import { getCondition, getShift } from './getEnums';

const timeZone = 'America/Lima';
export function getBodyEmail(
  student: string,
  currentTime: Date,
  arrivalDate: Date,
  shift: Shift,
  condition: ConditionAttendance,
) {
  const bodyEmail = `

  <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 20px;
      color: #007bff;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
    }
    .highlight {
      color: #007bff;
    }
    .footer {
      font-size: 12px;
      color: #888;
      margin-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Datos de Asistencia</h1>
    <p><strong>Estudiante:</strong> <span class="highlight">${student}</span></p>
    <p><strong>Hora:</strong> <span class="highlight">${moment.utc(currentTime).tz(timeZone).format('HH:mm:ss')}</span></p>
    <p><strong>Fecha:</strong> <span class="highlight">${arrivalDate}</span></p>
    <p><strong>Condición:</strong> <span class="highlight">${getCondition(condition)}</span></p>
    <p><strong>Turno:</strong> <span class="highlight">${getShift(shift)}</span></p>
    <div class="footer">
      Este correo se ha generado automáticamente. Si tienes alguna duda, por favor, contacta con el administrador.
    </div>
  </div>
</body>
</html>

        



                                `;
  return bodyEmail;
}

export function getText(
  student: string,
  currentTime: Date,
  arrivalDate: Date,
  shift: Shift,
  condition: ConditionAttendance,
) {
  const text = `
Datos de Asistencia:

Estudiante: ${student}
Hora: ${moment.utc(currentTime).tz(timeZone).format('HH:mm:ss')}
Fecha: ${arrivalDate}
Condición: ${getCondition(condition)}
Turno: ${getShift(shift)}

Este correo se ha generado automáticamente. Si tienes alguna duda, por favor, contacta con el administrador.

`;

  return text;
}
