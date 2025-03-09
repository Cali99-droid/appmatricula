export function getBodyEmail(body: string, student: string, parent: string) {
  const bodyEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación del Colegio AE</title>
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
      text-align: center;
    }
    .logo {
      max-width: 100%;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      color: #0056b3;
      margin-bottom: 15px;
    }
    .info {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      text-align: left;
    }
    .content {
      padding: 15px;
      border-radius: 5px;
      background-color: #f9f9f9;
      margin-top: 10px;
      text-align: left;
    }
    .cta {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
    }
    .cta:hover {
      background-color: #0056b3;
    }
    .footer {
      font-size: 12px;
      color: #666;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://scontent.flim10-1.fna.fbcdn.net/v/t39.30808-6/306842728_10159403539037639_8794233969106677427_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=Y_q07E3dGkIQ7kNvgFZvu_K&_nc_oc=AdiPok5PjMqdVm3kG-9apW4fzMDllyErLKLoPgr4XfEt6gkOaA7uzybNdtvB0RNnJy1g-3-79TaEbig2X4N35O6H&_nc_zt=23&_nc_ht=scontent.flim10-1.fna&_nc_gid=AuraWh9_SZsrgMk1dXE2Bbu&oh=00_AYApP0jFEY8BeUYGE5KrymkVOd4GMVm84R731uwB51KEqQ&oe=67CEC299" alt="Logo Colegio AE">
    
    <h1>Comunicado</h1>

    <p class="info">Para: <strong>${parent}</strong></p>
    <p class="info">Alumno(a): <strong>${student}</strong></p>

    <div class="content">
      ${body}
    </div>

    <div class="footer">
      Este correo se ha generado automáticamente. Si tienes alguna duda, por favor, contacta con el administrador.
    </div>
  </div>
</body>
</html>


        



                                `;
  return bodyEmail;
}

export function getText(body: string, student: string, parent: string) {
  const text = `
    <h1>Comunicado</h1>
     <p class="info">Para: <strong>${parent}</strong></p>
    <p class="info">Alumno(a): <strong>${student}</strong></p>
${body}

Este correo se ha generado automáticamente. Si tienes alguna duda, por favor, contacta con el administrador.

`;

  return text;
}
