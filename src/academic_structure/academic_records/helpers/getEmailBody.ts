export function getBoletaEmailTemplate(reportData: any): string {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { color: #2c3e50; }
          .footer { margin-top: 20px; font-size: 0.9em; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.schoolName}</h1>
          <h2>Boleta de Notas - ${reportData.bimesterName}</h2>
        </div>
        
        <p>Estimado apoderado de <strong>${reportData.studentName}</strong>,</p>
        
        <p>Se adjunta la boleta de notas correspondiente al ${reportData.bimesterName}.</p>
        
        <p><strong>Detalles:</strong></p>
        <ul>
          <li>Grado: ${reportData.level}</li>
          <li>Aula: ${reportData.classroom}</li>
          <li>Periodo: ${reportData.year}</li>
        </ul>
        
        <div class="footer">
          <p>Este es un mensaje automático, por favor no responda a este correo.</p>
          <p>© ${new Date().getFullYear()} ${reportData.schoolName}</p>
        </div>
      </body>
      </html>
    `;
}
