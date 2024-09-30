import { Controller, Get, Param, Res } from '@nestjs/common';

import { Response } from 'express';
import { PdfService } from './pdf.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { GetUser } from 'src/auth/decorators/get-user.decorator';
// import { Auth } from 'src/auth/decorators/auth.decorator';
// import { User } from 'src/user/entities/user.entity';
//cambio
@ApiTags('Docs')
@Controller('docs')
export class DocsController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('download-carnets/:activityClassroomId')
  @ApiOperation({
    summary: 'download pdf with carnets students of Activity classroom',
  })
  @ApiResponse({
    status: 200,
    description: 'Pdf with carnets of de classroom',
  })
  async downloadCarnets(
    @Res() res: Response,
    @Param('activityClassroomId') id: string,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfWithQRCodes(+id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=carnets.pdf');
    res.send(pdfBuffer);
  }

  @Get('download-carnet/student/:enrollmentId')
  @ApiOperation({
    summary: 'download  carnet of the student',
  })
  @ApiResponse({
    status: 200,
    description: 'Pdf with carnet of the student',
  })
  async downloadCarnet(
    @Res() res: Response,
    @Param('enrollmentId') id: string,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfWithQRCodesStudent(+id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=carnets.pdf');
    res.send(pdfBuffer);
  }

  @Get('download-contract/:idStudent')
  @ApiOperation({
    summary: 'download pdf with carnets students of Activity classroom',
  })
  @ApiResponse({
    status: 200,
    description: 'Pdf with carnets of de classroom',
  })
  // @Auth()
  // async downloadContract(@Res() res: Response, @GetUser() user: User) {
  //   const pdfBuffer = await this.pdfService.generatePdfContract(user);
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'attachment; filename=carnets.pdf');
  //   res.send(pdfBuffer);
  // }
  async downloadContract(
    @Res() res: Response,
    @Param('idStudent') idStudent: string,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfContract(+idStudent);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=carnets.pdf');
    res.send(pdfBuffer);
  }
}
