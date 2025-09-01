export interface EmailTemplateParams {
  parentName: string;
  studentName: string;
  requestCode: string;
  hasDebts: boolean;
  statusCheckUrl: string; // URL de la página para consultar estado
}

export function generateRegistrationEmail(params: EmailTemplateParams) {
  const {
    parentName,
    studentName,
    requestCode,
    statusCheckUrl,
    hasDebts = false,
  } = params;

  const subject = `Confirmación de Solicitud de Traslado - Código: ${requestCode}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #004a99; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .code-box { background-color: #f2f2f2; border: 1px dashed #ccc; padding: 15px; text-align: center; margin: 20px 0; }
        .code { font-size: 20px; font-weight: bold; color: #d9534f; letter-spacing: 2px; }
        .footer { font-size: 12px; text-align: center; color: #777; margin-top: 20px; }
        a.button { display: inline-block; background-color: #5cb85c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Colegio AE</h2>
        </div>
        <div class="content">
          <p>Estimado(a) ${parentName},</p>
          <p>Hemos recibido y registrado exitosamente su <strong>solicitud de traslado</strong> para el/la estudiante <strong>${studentName}</strong>.</p>
          <p>Su solicitud ha ingresado a nuestro sistema y ha comenzado el proceso de evaluación a cargo de los departamentos de Psicología y Coordinación de Sede.</p>
          
          <div class="code-box">
            <span>Su código de seguimiento es:</span>
            <p class="code">${requestCode}</p>
            <span>Guarde este código, ya que lo necesitará para consultar el estado de su solicitud.</span>
          </div>
          
          <p>Puede verificar el avance de su solicitud en cualquier momento a través de nuestro portal:</p>
          <p style="text-align:center;">
            <a href="${statusCheckUrl}" class="button">Consultar Estado de la Solicitud</a>
          </p>
            ${hasDebts ? '<div class="code-box"><p style="text-align:center;">Le recordamos que tiene deudas vencidas, que tedrá que cancelar para que el proceso continué </p></div>' : ''}
           
          
          <p>Le mantendremos informado(a) sobre las siguientes etapas del proceso. Gracias por su confianza.</p>
          <br>
          <p>Atentamente,<br>
          <strong>Administración - Colegio AE</strong>
          </p>
        </div>
        <div class="footer">
          <p>Este es un correo electrónico generado automáticamente, por favor no responda directamente. Si tiene alguna consulta, comuníquese con nuestro canal de soporte.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
