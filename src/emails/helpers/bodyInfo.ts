/**
 * Genera el cuerpo del correo HTML con un botón de descarga.
 * @param downloadLink - La URL que se anclará al botón.
 * @returns String con el HTML completo.
 */
export function getSchoolDocumentsEmail(downloadLink: string): string {
  // Definimos colores y estilos base para facilitar cambios futuros
  const primaryColor = '#0056b3'; // Azul institucional profesional
  const textColor = '#333333';
  const fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Información Académica 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: ${fontFamily};">
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 20px;">
        
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <tr>
            <td style="padding: 40px 30px;">
              
              <h2 style="color: ${textColor}; margin-top: 0; font-size: 20px;">Estimado padre de familia:</h2>
              
              <p style="color: ${textColor}; font-size: 16px; line-height: 1.6;">
                Reciba un cordial saludo. Por medio del presente, hacemos llegar información importante correspondiente al <strong>año académico 2026</strong>, incluyendo el Reglamento Interno, los Costos 2026, las Condiciones Económicas y otros documentos de interés.
              </p>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${downloadLink}"
                     style="background-color: ${primaryColor}; 
                            color: #ffffff; 
                            display: inline-block; 
                            font-size: 16px; 
                            font-weight: bold; 
                            line-height: 50px; 
                            text-align: center; 
                            text-decoration: none; 
                            width: 250px; 
                            border-radius: 5px; 
                            -webkit-text-size-adjust: none;">
                    Descargar Documentos
                  </a>
                </div>

              <p style="color: ${textColor}; font-size: 16px; line-height: 1.6;">
                Agradecemos su atención.
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="color: ${textColor}; font-size: 16px; font-weight: bold; margin: 0;">
                  Atentamente,<br>La Dirección
                </p>
              </div>

            </td>
          </tr>
        </table>
        
        <table width="600" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding-top: 20px; color: #999999; font-size: 12px;">
                    &copy; 2025 Institución Educativa. Todos los derechos reservados.
                </td>
            </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}
