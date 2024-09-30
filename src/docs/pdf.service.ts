import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import * as PDFDocument from 'pdfkit';
// import 'pdfkit-table';
import * as QRCode from 'qrcode';
import * as sharp from 'sharp';
import { ActivityClassroom } from 'src/activity_classroom/entities/activity_classroom.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { TypePhase } from 'src/phase/enum/type-phase.enum';
import { addContractHeader } from './contract/header';
import { Repository } from 'typeorm';
// import { User } from 'src/user/entities/user.entity';
// import { addClausesPart1 } from './contract/clauses-part1';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepositoy: Repository<Enrollment>,
    private readonly configService: ConfigService,
  ) {}
  async generatePdfWithQRCodes(id: number): Promise<Buffer> {
    const activityClassroom = await this.activityClassroomRepository.findOne({
      relations: {
        enrollment: {
          student: {
            person: true,
          },
          activityClassroom: {
            classroom: {
              campusDetail: true,
            },
            grade: {
              level: true,
            },
            phase: {
              year: true,
            },
          },
        },
      },
      where: {
        id,
      },
    });
    if (!activityClassroom) {
      throw new NotFoundException('Not exist Classroom');
    }
    //TODO  OPTIMIZAR todo esto*/
    const urlS3 = this.configService.getOrThrow('AWS_URL_BUCKET');
    const folderName = this.configService.getOrThrow('FOLDER_IMG_NAME');
    const defaultAvatar = this.configService.getOrThrow('AVATAR_NAME_DEFAULT');
    const fullUrl = this.configService.getOrThrow('FULL_URL_S3');
    const urlPhoto = `${urlS3}${folderName}`;
    const enroll = activityClassroom.enrollment[0];

    const students = activityClassroom.enrollment.map((a) => ({
      id: a.student.id,
      name: a.student.person.name,
      lastname: a.student.person.lastname,
      mLastname: a.student.person.mLastname,
      docNumber: a.student.person.docNumber,
      grade: activityClassroom.grade.name,
      level: activityClassroom.grade.level.name,
      section: activityClassroom.section,
      studentCode:
        a.student.studentCode === null
          ? a.student.person.studentCode
          : a.student.studentCode,
      photo: a.student.photo
        ? `${urlPhoto}/${a.student.photo}`
        : `${urlPhoto}/${defaultAvatar}`,
      codeEnroll: a.code,
      code: a.student.code,
    }));
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: [153, 241] }); // Tamaño en puntos para 85.60 × 53.98 mm
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      // Encabezado en cada página

      for (const student of students) {
        // doc.rect(5, 5, 20, 20).fill('#C1CFFF');
        // doc.rect(0, 0, 20, 20).fill('#99AAFF');
        // setupHeader(doc);
        const imageUrl = student.photo;

        try {
          const urlBack = fullUrl + 'carnet.png';

          const background = await this.fetchImage(urlBack);

          doc.image(background, 0, 0, { width: 153, height: 241 });

          let imageBuffer = await this.fetchImage(imageUrl);
          imageBuffer = await this.convertWebPToPNG(imageBuffer);
          doc.image(imageBuffer, 49, 81, {
            width: 58,
            height: 73,
            align: 'center',
          }); // Ajusta según necesidades de diseño
        } catch (error) {
          reject(error);
        }
        const name = student.name.split(' ')[0].toUpperCase();
        const fullName = `${student.lastname.toUpperCase()} ${student.mLastname.charAt(0).toUpperCase()}.`;
        // doc.fontSize(12).text(`ID: ${student.id}`, 80, 50);
        doc.fontSize(10).fillColor('white').text(`${name}`, 0, 162, {
          width: 153,
          height: 200,
          align: 'center',
        });
        doc.fontSize(8).fillColor('white').text(`${fullName}`, 0, 172, {
          width: 153,
          height: 200,
          align: 'center',
        });
        doc
          .fontSize(6)
          .fillColor('white')
          .text(`CE: ${student.code}`, 100, 183, {
            width: 50,
            height: 241,
            align: 'right',
          });
        doc
          .fontSize(7)
          .fillColor('white')
          .text(
            `SEDE: ${enroll.activityClassroom.classroom.campusDetail.name.toLocaleUpperCase()}`,
            60,
            195,
            {
              width: 153,
              height: 241,
            },
          );
        doc
          .fontSize(7)
          .fillColor('white')
          .text(
            `NIVEL: ${enroll.activityClassroom.grade.level.name.toLocaleUpperCase()}`,
            60,
            205,
            {
              width: 153,
              height: 241,
            },
          );
        doc
          .fontSize(7)
          .fillColor('white')
          .text(
            `GRADO: ${enroll.activityClassroom.grade.name.toLocaleUpperCase()}`,
            60,
            215,
            {
              width: 153,
              height: 241,
            },
          );
        doc
          .fontSize(7)
          .fillColor('white')
          .text(
            `SECCIÓN: "${enroll.activityClassroom.section.toLocaleUpperCase()}"`,
            60,
            225,
            {
              width: 153,
              height: 241,
            },
          );

        // doc.fontSize(10).text(`Grado: ${student.grado}`, 80, 60);
        // //http://localhost:3000/api/v1/docs/download-carnets/3
        //  Generar código QR
        doc
          .fontSize(4)
          .fillColor('white')
          .text(
            `${enroll.activityClassroom.phase.year.name}-${enroll.activityClassroom.phase.type}`,
            6,
            180,
            {
              width: 153,
              height: 241,
            },
          );
        const code = student.codeEnroll
          ? student.codeEnroll
          : `${enroll.activityClassroom.phase.year.name}${enroll.activityClassroom.phase.type === TypePhase.Regular ? '1' : '2'}S${student.id}`;

        const qr = await QRCode.toDataURL(code);
        doc.image(qr, 6, 186, { width: 50, height: 50 });
        doc
          .lineJoin('round')
          .lineWidth(3)
          .rect(48, 80, 60, 75)
          .fillOpacity(0)
          .fillAndStroke('white', '#0089DA');
        doc.addPage();
      }

      doc.end();
    });
  }
  async generatePdfWithQRCodesStudent(id: number): Promise<Buffer> {
    const enroll = await this.enrollmentRepositoy.findOneBy({ id });
    if (!enroll) {
      throw new NotFoundException('Not exits Enrrol');
    }
    const { student } = enroll;
    //TODO  OPTIMIZAR todo esto*/

    const defaultAvatar = this.configService.getOrThrow('AVATAR_NAME_DEFAULT');
    const fullUrl = this.configService.getOrThrow('FULL_URL_S3');

    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: [153, 241] }); // Tamaño en puntos para 85.60 × 53.98 mm
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // doc.rect(5, 5, 20, 20).fill('#C1CFFF');
      // doc.rect(0, 0, 20, 20).fill('#99AAFF');
      // setupHeader(doc);
      const imageUrl = student.photo
        ? `${fullUrl}${student.photo}`
        : `${fullUrl}${defaultAvatar}`;

      try {
        const urlBack = fullUrl + 'carnet.png';

        const background = await this.fetchImage(urlBack);

        doc.image(background, 0, 0, { width: 153, height: 241 });

        let imageBuffer = await this.fetchImage(imageUrl);
        imageBuffer = await this.convertWebPToPNG(imageBuffer);
        doc.image(imageBuffer, 49, 81, {
          width: 58,
          height: 73,
          align: 'center',
        }); // Ajusta según necesidades de diseño
      } catch (error) {
        reject(error);
      }
      const name = student.person.name.split(' ')[0].toUpperCase();
      const fullName = `${student.person.lastname.toUpperCase()} ${student.person.mLastname.charAt(0).toUpperCase()}.`;
      // doc.fontSize(12).text(`ID: ${student.id}`, 80, 50);
      doc.fontSize(10).fillColor('white').text(`${name}`, 0, 162, {
        width: 153,
        height: 200,
        align: 'center',
      });
      doc.fontSize(8).fillColor('white').text(`${fullName}`, 0, 172, {
        width: 153,
        height: 200,
        align: 'center',
      });
      doc.fontSize(6).fillColor('white').text(`CE: ${student.code}`, 100, 183, {
        width: 50,
        height: 241,
        align: 'right',
      });
      doc
        .fontSize(7)
        .fillColor('white')
        .text(
          `SEDE: ${enroll.activityClassroom.classroom.campusDetail.name.toLocaleUpperCase()}`,
          60,
          195,
          {
            width: 153,
            height: 241,
          },
        );
      doc
        .fontSize(7)
        .fillColor('white')
        .text(
          `NIVEL: ${enroll.activityClassroom.grade.level.name.toLocaleUpperCase()}`,
          60,
          205,
          {
            width: 153,
            height: 241,
          },
        );
      doc
        .fontSize(7)
        .fillColor('white')
        .text(
          `GRADO: ${enroll.activityClassroom.grade.name.toLocaleUpperCase()}`,
          60,
          215,
          {
            width: 153,
            height: 241,
          },
        );
      doc
        .fontSize(7)
        .fillColor('white')
        .text(
          `SECCIÓN: "${enroll.activityClassroom.section.toLocaleUpperCase()}"`,
          60,
          225,
          {
            width: 153,
            height: 241,
          },
        );
      // doc.fontSize(10).text(`Grado: ${student.grado}`, 80, 60);
      //http://localhost:3000/api/v1/docs/download-carnets/3
      //  Generar código QR
      doc
        .fontSize(4)
        .fillColor('white')
        .text(
          `${enroll.activityClassroom.phase.year.name}-${enroll.activityClassroom.phase.type}`,
          6,
          180,
          {
            width: 153,
            height: 241,
          },
        );

      const code = enroll.code
        ? enroll.code
        : `${enroll.activityClassroom.phase.year.name}${enroll.activityClassroom.phase.type === TypePhase.Regular ? '1' : '2'}S${student.id}`;
      //${classroom.phase.year.name}${classroom.phase.type === TypePhase.Regular ? '1' : '2'}S${student.id}
      const qr = await QRCode.toDataURL(code);
      doc.image(qr, 6, 186, { width: 50, height: 50 });
      doc
        .lineJoin('round')
        .lineWidth(3)
        .rect(48, 80, 60, 75)
        .fillOpacity(0)
        .fillAndStroke('white', '#0089DA');

      doc.end();
    });
  }
  async generatePdfContract(idStudent: number): Promise<Buffer> {
    // const enroll = await this.enrollmentRepositoy.findOneBy({ id });
    // if (!enroll) {
    //   throw new NotFoundException('Not exits Enrrol');
    // }
    // const { student } = enroll;

    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 47,
          bottom: 47,
          left: 47,
          right: 66,
        },
      });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      addContractHeader(doc);
      // addClausesPart1(doc);
      doc.end();
    });
  }
  async fetchImage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return buffer;
  }
  async convertWebPToPNG(buffer: ArrayBuffer): Promise<Buffer> {
    return sharp(buffer).png().resize({ width: 200, height: 250 }).toBuffer();
  }
}
