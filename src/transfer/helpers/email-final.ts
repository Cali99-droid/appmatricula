export interface DecisionEmailParams {
  parentName: string;
  studentName: string;
  requestCode: string;
  approved: boolean;
  reason?: string; // Motivo, especialmente importante si fue rechazada
  hasDebts: boolean;
}

export function generateDecisionEmail(params: DecisionEmailParams) {
  const {
    parentName,
    studentName,
    requestCode,
    approved,
    reason,
    hasDebts = false,
  } = params;

  let subject = '';
  let html = '';

  const commonStyles = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .header { color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; }
    .status-box { border: 1px solid #ccc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
    .status-title { font-size: 22px; font-weight: bold; margin: 0; }
    .footer { font-size: 12px; text-align: center; color: #777; margin-top: 20px; }
  `;

  if (approved) {
    subject = `✅ Resolución Favorable - Solicitud de Traslado #${requestCode}`;
    html = `
      <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body>
      <div class="container">
        <div class="header" style="background-color: #28a745;"><h2>Resolución de Solicitud</h2></div>
        <div class="content">
          <p>Estimado(a) ${parentName},</p>
          <p>Nos complace informarle que, tras una cuidadosa evaluación, la solicitud de traslado para el/la estudiante <strong>${studentName}</strong> ha sido:</p>
          
          <div class="status-box" style="border-color: #28a745; background-color: #e9f5ec;">
            <p class="status-title" style="color: #28a745;">APROBADA</p>
          </div>
          
          <h4>Siguientes Pasos</h4>
          <p>El proceso está casi completo. En los próximos días hábiles, nuestro equipo administrativo <strong>se comunicará con usted para coordinar la fecha y hora para la firma del Acta de Cambio de Sección</strong>, el cual es el último paso para oficializar el traslado.</p>
          <p>Agradecemos su paciencia y colaboración durante todo el proceso.</p>
          <br>
           ${hasDebts ? '<div class="code-box"><p style="text-align:center;">Le recordamos que tiene deudas vencidas, que tedrá que cancelar para que el proceso continué </p></div>' : ''}
            <br>
          <p>Atentamente,<br><strong>Administración - Colegio AE</strong></p>

            
        </div>
        <div class="footer"><p>Este es un correo informativo. Para consultas, por favor contacte a nuestro canal de soporte.</p></div>
      </div></body></html>
    `;
  } else {
    subject = `❌ Resolución de Solicitud de Traslado #${requestCode}`;
    html = `
      <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body>
      <div class="container">
        <div class="header" style="background-color: #dc3545;"><h2>Resolución de Solicitud</h2></div>
        <div class="content">
          <p>Estimado(a) ${parentName},</p>
          <p>Le informamos que, tras una cuidadosa evaluación por parte de nuestro comité, la solicitud de traslado para el/la estudiante <strong>${studentName}</strong> ha sido:</p>
          
          <div class="status-box" style="border-color: #dc3545; background-color: #f8d7da;">
            <p class="status-title" style="color: #dc3545;">NO APROBADA</p>
          </div>
          
          <h4>Motivo de la Decisión</h4>
          <p><em>${reason || 'El comité ha determinado que no se cumplen los criterios necesarios para el traslado en este momento.'}</em></p>
          <p>Entendemos que esta noticia pueda no ser la esperada. Si desea más detalles o conversar sobre el resultado, no dude en comunicarse con la coordinación de sede.</p>
          <p>Agradecemos su interés y tiempo.</p>
          <br>
          <p>Atentamente,<br><strong>Administración - Colegio AE</strong></p>
        </div>
        <div class="footer"><p>Este es un correo informativo. Para consultas, por favor contacte a nuestro canal de soporte.</p></div>
      </div></body></html>
    `;
  }

  // Versión de texto plano para clientes de correo que no soportan HTML
  const text = `Estimado(a) ${parentName}, le informamos sobre la resolución de su solicitud de traslado #${requestCode}. Por favor, revise el contenido de este correo para ver los detalles.`;

  return { subject, html, text };
}
