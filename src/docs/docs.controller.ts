import { Controller, Get, Param, Query, Res } from '@nestjs/common';

import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { PdfService } from './pdf.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DownloadContractQueryDto } from './dto/downloadContractQuery.dto';
import { DownloadConstancyQueryDto } from './dto/downloadConstancyQuery.dto';
import { Public, Resource } from 'nest-keycloak-connect';
import { CardInput } from './interfaces/card-input.inteface';
// import { GetUser } from 'src/auth/decorators/get-user.decorator';
// import { Auth } from 'src/auth/decorators/auth.decorator';
// import { User } from 'src/user/entities/user.entity';
//cambio
@ApiTags('Docs')
@Controller('docs')
@Resource('client-test-appae')
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
  @Public()
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
  @Public()
  async downloadCarnet(
    @Res() res: Response,
    @Param('enrollmentId') id: string,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfWithQRCodesStudent(+id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=carnets.pdf');
    res.send(pdfBuffer);
  }

  @Get('download-report-card/student/:enrollmentId')
  @Public()
  async downloadStudentReportCard(
    @Res() res: Response,
    @Param('enrollmentId') id: string,
  ) {
    try {
      const pdfBuffer = await this.pdfService.generateReportCard();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=student-report.pdf',
        // 'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Error generating PDF',
        error: error.message,
      });
    }
  }

  @Get('download-contract/:idStudent')
  @ApiOperation({
    summary: 'download pdf with contract students of Activity classroom',
  })
  @ApiResponse({
    status: 200,
    description: 'Pdf with contract of de classroom',
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
    @Query() query: DownloadContractQueryDto,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfContract(
      +idStudent,
      query,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=contracto.pdf');
    res.send(pdfBuffer);
  }
  @Get('download-constancy/:idStudent')
  @ApiOperation({
    summary: 'download pdf with constancy students',
  })
  @ApiResponse({
    status: 200,
    description: 'Pdf with constancy',
  })
  async downloadConstancy(
    @Res() res: Response,
    @Param('idStudent') idStudent: string,
    @Query() query: DownloadConstancyQueryDto,
  ) {
    const pdfBuffer = await this.pdfService.generatePdfContancy(
      +idStudent,
      query,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=constancia.pdf');
    res.send(pdfBuffer);
  }
}
