import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

// import PDFDocument from 'pdfkit';
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
import { addClausesPart1 } from './contract/clauses-part1';
import { addClausesPart2 } from './contract/clauses-part2';
import { addClausesPart3 } from './contract/clauses-part3';
import { addAnexo } from './contract/anexo';
import { Student } from 'src/student/entities/student.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DownloadContractQueryDto } from './dto/downloadContractQuery.dto';
import { Year } from 'src/years/entities/year.entity';
import { Level } from 'src/level/entities/level.entity';
import { CampusDetail } from 'src/campus_detail/entities/campus_detail.entity';
import { addConstancy } from './constancy/constancy';
import { Status } from 'src/enrollment/enum/status.enum';
import { Person } from 'src/person/entities/person.entity';
import { DownloadConstancyQueryDto } from './dto/downloadConstancyQuery.dto';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(ActivityClassroom)
    private readonly activityClassroomRepository: Repository<ActivityClassroom>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepositoy: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Year)
    private readonly yearRepository: Repository<Year>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(CampusDetail)
    private readonly campusDetailRepository: Repository<CampusDetail>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    private readonly httpService: HttpService,

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
  async generatePdfContract(
    idStudent: number,
    query: DownloadContractQueryDto,
  ): Promise<Buffer> {
    const student = await this.studentRepository.findOne({
      where: { id: idStudent },
      relations: {
        family: {
          respEnrollment: {
            user: true,
          },
        },
      },
    });

    if (!student)
      throw new NotFoundException(`Student with id ${idStudent} not found`);
    if (!student.family)
      throw new NotFoundException(`This student does not have family`);
    if (!student.family.respEnrollment)
      throw new NotFoundException(
        `This student's family priest doesn't responsible for enrollment`,
      );
    // if (!student.family.respEnrollment.user)
    //   throw new NotFoundException(
    //     `This student's family priest doesn't have a user`,
    //   );
    if (!student.family.respEnrollment)
      throw new NotFoundException(
        `This student does not have a registration responsible`,
      );
    if (!student.family.district)
      throw new NotFoundException(`This student does not have a district`);

    const classRoom = await this.activityClassroomRepository.findOne({
      where: { id: query.activityClassRoomId },
      relations: {
        grade: { level: true },
        classroom: {
          campusDetail: true,
        },
        phase: { year: true },
      },
    });
    if (!classRoom)
      throw new NotFoundException(`This classroom does not exist`);
    const year = await this.yearRepository.findOne({
      where: { status: true },
    });
    if (!year) throw new NotFoundException(`There is no active year`);

    const numContra = `${classRoom.classroom.campusDetail.name.toUpperCase()} - ${classRoom.grade.level.name.toUpperCase()} - ${classRoom.grade.name.toUpperCase()} - ${classRoom.section} - ${student.family.nameFamily} - ${student.person.docNumber.slice(-2)}`;
    const name = `${student.family.respEnrollment.name} ${student.family.respEnrollment.lastname} ${student.family.respEnrollment.mLastname} `;
    const typeDoc = student.family.respEnrollment.typeDoc;
    const docNumber = student.family.respEnrollment.docNumber;
    const address = student.family.address;
    const dataCity = await this.getCites(student.family.district);
    const district = dataCity.district;
    const province = dataCity.province;
    const department = dataCity.region;
    const yearName = classRoom.phase.year.name;
    const dayClassStart = '10';
    const dayClassEnd = '17';
    const priceEnrollment = '350';
    const priceAdmission = '350';
    const levelName = classRoom.grade.level.name.toUpperCase();
    const gradeName = classRoom.grade.name.toUpperCase();
    const section = classRoom.section.toUpperCase();
    let priceYear: any;
    let priceMounth: any;
    const campus = classRoom.classroom.campusDetail.name.toUpperCase();
    const email = student.family.respEnrollment.user?.email;
    const cellPhone = student.family.respEnrollment.cellPhone;
    const nameSon = `${student.person.lastname} ${student.person.mLastname}, ${student.person.name}`;

    //para calcular el precio por nivel
    if (classRoom.grade.level.id === 1) {
      priceYear = '3900';
      priceMounth = '390';
    }
    if (classRoom.grade.level.id === 2) {
      priceYear = '4000';
      priceMounth = '400';
    }
    if (classRoom.grade.level.id === 3) {
      priceYear = '4200';
      priceMounth = '420';
    }
    return new Promise(async (resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 47,
          bottom: 47,
          left: 47,
          right: 66,
        },
      });
      // const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      addContractHeader(
        doc,
        numContra,
        name,
        typeDoc,
        docNumber,
        address,
        district,
        province,
        department,
        yearName,
        dayClassStart,
        dayClassEnd,
      );
      addClausesPart1(
        doc,
        priceEnrollment,
        priceAdmission,
        levelName,
        priceYear,
        priceMounth,
        campus,
      );
      addClausesPart2(doc, yearName, dayClassStart, dayClassEnd);
      addClausesPart3(
        doc,
        email,
        cellPhone,
        campus,
        levelName,
        gradeName,
        section,
        nameSon,
      );
      const pageWidth = doc.page.width;
      const margin = 100;
      const imageWidth = 120;
      doc.moveDown();
      doc.moveDown();
      doc.moveDown();
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(`________________________`, {
          align: 'left',
          width: doc.page.width - margin * 2 - imageWidth,
        });
      doc
        .font('Helvetica')
        .fontSize(6)
        .text(`${name}`, {
          align: 'left',
          width: doc.page.width - margin * 2 - imageWidth,
        });
      // doc.moveDown();
      // doc
      //   .font('Helvetica')
      //   .fontSize(9)
      //   .text(`NOMBRES:…………………………………………………`, {
      //     align: 'left',
      //     width: doc.page.width - margin * 2 - imageWidth,
      //   });
      doc.moveDown();
      doc
        .font('Helvetica')
        .fontSize(7)
        .text(`                    ${typeDoc.toUpperCase()}: ${docNumber}`, {
          align: 'left',
          width: doc.page.width - margin * 2 - imageWidth,
        });
      const fullUrl = this.configService.getOrThrow('FULL_URL_S3');
      // const imageUrlSignature = `https://caebucket.s3.us-west-2.amazonaws.com/colegio/1713420896762.webp`;
      const imageUrlSignature = `${fullUrl}contrato/signature.jpg`;
      const imageUrl1 = `${fullUrl}contrato/inicial-dos.jpg`;
      const imageUrl2 = `${fullUrl}contrato/sede-celeste.jpg`;
      const imageUrl3 = `${fullUrl}contrato/inicial.jpg`;
      const imageUrl4 = `${fullUrl}contrato/sede-azul.jpg`;
      const imageUrl5 = `${fullUrl}contrato/sede-moderna.jpg`;

      const imageSignature = await this.fetchImage(imageUrlSignature);
      const image1 = await this.fetchImage(imageUrl1);
      const image2 = await this.fetchImage(imageUrl2);
      const image3 = await this.fetchImage(imageUrl3);
      const image4 = await this.fetchImage(imageUrl4);
      const image5 = await this.fetchImage(imageUrl5);

      // console.log(imageSignature);
      // imageSignature = await this.convertWebPToPNG(imageSignature);

      doc.image(
        imageSignature,
        pageWidth - margin - imageWidth + 30,
        doc.y - 40,
        {
          width: imageWidth,
          // align: 'center',
        },
      );
      addAnexo(doc);
      doc.image(image1, 55, doc.y - 250, {
        width: 80,
        // align: 'center',
      });
      doc.image(image2, 140, doc.y - 250, {
        width: 90,
        // align: 'center',
      });
      doc.image(image3, 55, doc.y - 150, {
        width: 80,
        // align: 'center',
      });
      doc.image(image4, 140, doc.y - 150, {
        width: 90,
        // align: 'center',
      });
      doc.image(image5, 55, doc.y - 50, {
        width: 80,
        // align: 'center',
      });
      doc.end();
    });
  }
  async generatePdfContancy(
    idStudent: number,
    query: DownloadConstancyQueryDto,
  ): Promise<Buffer> {
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const student = await this.studentRepository.findOne({
      where: { id: idStudent },
      relations: {
        family: {
          respEnrollment: {
            user: true,
          },
        },
      },
    });
    if (!student)
      throw new NotFoundException(`Student with id ${idStudent} not found`);
    const parentData = await this.personRepository.findOne({
      where: { id: query.parentId },
    });

    if (!parentData)
      throw new NotFoundException(`Parent with id ${query.parentId} not found`);

    const enrollment = await this.enrollmentRepositoy.findOne({
      where: { student: { id: idStudent }, status: Status.RESERVADO },
      select: ['id', 'createdAt'],
      relations: {
        activityClassroom: {
          grade: { level: true },
        },
      },
    });
    if (!enrollment)
      throw new NotFoundException(
        `The student does not have a registration with reserved status`,
      );
    const today = new Date(enrollment.createdAt);
    const day = today.getDate();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 25);
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    const parent = `${parentData.name.toUpperCase()} ${parentData.lastname.toUpperCase()} ${parentData.mLastname.toUpperCase()}`;
    const children = `${student.person.name.toUpperCase()} ${student.person.lastname.toUpperCase()} ${student.person.mLastname.toUpperCase()}`;

    const level = enrollment.activityClassroom.grade.level.name.toUpperCase();
    const grade = enrollment.activityClassroom.grade.name.toUpperCase();
    const endVacant = `${String(futureDate.getDate()).padStart(2, '0')}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${futureDate.getFullYear()}`;
    //para calcular el precio por nivel
    return new Promise(async (resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 47,
          bottom: 47,
          left: 47,
          right: 66,
        },
      });
      // const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      const fullUrl = this.configService.getOrThrow('AWS_URL_BUCKET');
      const imageUrl1 = `${fullUrl}recursos/constancia-header.png`;
      const imageUrlFirma = `${fullUrl}recursos/constancia-firma.png`;
      const image1 = await this.fetchImage(imageUrl1);
      const imageFirma = await this.fetchImage(imageUrlFirma);
      doc.image(image1, 0, 0, { width: doc.page.width, align: 'center' });
      doc.moveDown(6);

      const data = {
        parent,
        children,
        endVacant,
        day,
        month,
        year,
        level,
        grade,
      };
      const imageWidth = 250;
      const imageHeight = 100;
      const pageWidth = doc.page.width;
      const xPosition = (pageWidth - imageWidth) / 2;

      doc.image(imageFirma, xPosition, 550, {
        width: imageWidth,
        height: imageHeight,
      });
      addConstancy(doc, data);
      doc.end();
    });
  }

  async fetchImage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return buffer;
  }
  async convertWebPToPNG(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    const pngBuffer = await sharp(buffer)
      .png()
      .resize({ width: 200, height: 250 })
      .toBuffer();

    // Convertir Buffer (Node.js) a ArrayBuffer
    return pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength,
    );
  }

  async getCites(idDistrict: string) {
    //OBTENER TODOS LOS DISTRITOS
    const url = this.configService.get('API_ADMISION');
    try {
      const dataDistrict = await firstValueFrom(
        this.httpService.get(`${url}/cities/district`),
      );
      // const dataDistricts = dataDistrict.data;
      const district = dataDistrict.data.data.find(
        (district: any) => district.id === idDistrict,
      );

      //OBTENER TODOS LAS PROVINCIAS
      const dataProvince = await firstValueFrom(
        this.httpService.get(`${url}/cities/province`),
      );
      const province = dataProvince.data.data.find(
        (province: any) => province.id === district.province_id,
      );
      //OBTENER TODOS LAS REGION
      const dataRegion = await firstValueFrom(
        this.httpService.get(`${url}/cities/region`),
      );
      const region = dataRegion.data.data.find(
        (region: any) => region.id === province.region_id,
      );
      return {
        region: region.name,
        province: province.name,
        district: district.name,
      };
    } catch (error) {
      throw error;
    }
  }

  async generateReportCard() {
    const url = this.configService.getOrThrow('AWS_URL_BUCKET');
    const logoUrl = `${url}recursos/logo.png`;
    const studentPhotoURL =
      'https://caebucket.s3.us-west-2.amazonaws.com/colegio/1717429805090.webp';
    const logo = await this.fetchImage(logoUrl);
    const studentBuffer = await this.fetchImage(studentPhotoURL);
    const studentPhoto = await this.convertWebPToPNG(studentBuffer);
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Configuración segura de dimensiones
        const leftMargin = 40;
        const pageWidth = doc.page.width - leftMargin * 2;
        const startY = 50;

        // Encabezado institucional
        doc.image(logo, 30, 30, { width: 70, height: 70 });
        doc
          .image(studentPhoto, 495, 30, { width: 58, height: 73 })
          .rect(495, 30, 58, 73)
          .stroke();
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .text('COLEGIO ALBERT EINSTEIN', {
            align: 'center',
          });

        doc.fontSize(12).text('INFORME DE LOS PROCESOS DEL EDUCANDO - 2024', {
          align: 'center',
          underline: true,
        });

        doc.fontSize(11).text('NIVEL SECUNDARIA', { align: 'center' });

        // Información del estudiante
        this.drawStudentInfo(doc, leftMargin, pageWidth, startY);
        // doc.moveDown(1);
        doc.fontSize(12).text('INFORME DE LOS PROCESOS DEL EDUCANDO - 2024');
        // Tabla principal de calificaciones
        // doc.table({
        //   data: [
        //     ['Column 1', 'Column 2', 'Column 3'],
        //     ['One value goes here', 'Another one here', 'OK?'],
        //   ],
        // });
        // this.drawMainTable(doc, leftMargin, pageWidth);
        doc.end();
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  private drawStudentInfo(
    doc: PDFKit.PDFDocument,
    leftMargin: number,
    pageWidth: number,
    startY: number,
  ) {
    const rowHeight = 60;
    const col1Width = 100;
    // const col2Width = pageWidth - col1Width;

    // Encabezados
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Código', leftMargin + 5, startY + rowHeight + 4)
      .text(
        'Apellidos y Nombres',
        leftMargin + col1Width + 5,
        startY + rowHeight + 4,
      );

    // Datos
    doc
      .font('Helvetica')
      .text('18024181', leftMargin + 5, startY + 80)
      .text(
        'ROBLES MINAYA OMAR LEONCIO',
        leftMargin + col1Width + 5,
        startY + 80,
      );
    doc
      .lineCap('butt')
      .moveTo(leftMargin, startY + rowHeight + 35)
      .lineTo(pageWidth + 40, startY + rowHeight + 35)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .text('Salón', leftMargin + 5, startY + rowHeight + 44)
      .font('Helvetica')
      .text(
        'SECUNDARIA - QUINTO - E',
        leftMargin + col1Width + 5,
        startY + rowHeight + 44,
      );

    // Bordes
    doc.rect(leftMargin, startY + rowHeight, pageWidth, rowHeight).stroke();
    doc
      .moveTo(leftMargin + col1Width, startY + rowHeight)
      .lineTo(leftMargin + col1Width, startY + rowHeight + rowHeight)
      .stroke();

    doc.y = startY + rowHeight * 2 + 10;
  }

  private createHeader(logo: any, studentPhoto: any): Content[] {
    return [
      {
        table: {
          widths: ['*', '*'], // Columnas de igual ancho
          body: [
            [
              // Celda izquierda (logo)
              {
                image: logo,
                width: 250,
                height: 50,
                alignment: 'left',
              },
              // Celda derecha (foto estudiante)
              {
                image: studentPhoto,
                width: 60,
                height: 70,
                alignment: 'right',
                margin: [0, -15, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders', // Oculta los bordes de la tabla
      },
    ];
  }

  private createStudentInfo(reportData: any): Content {
    return {
      // {

      style: 'tableExample',
      table: {
        widths: [100, '*', 200],
        body: [
          [
            {
              text: 'Código',
              style: 'tableHeader',
              fillColor: '#FFEFCA',
            },
            {
              text: 'Apellidos Y Nombres',
              style: 'tableHeader',
              fillColor: '#FFEFCA',
            },
            {
              text: 'Salón',
              style: 'tableHeader',
              fillColor: '#FFEFCA',
            },
          ],
          [
            { text: reportData.studentCode, alignment: 'center' },
            {
              text: reportData.studentName,
              color: '#767687',
              alignment: 'center',
            },
            {
              text: reportData.classroom,
              color: '#767687',
              alignment: 'center',
            },
          ],
        ],
      },
    };
  }

  private createAreasTable(reportData: any): Content {
    const tableBody = [
      [
        {
          text: '\nÁREA',
          style: 'tableHeader',
          rowSpan: 2,
          fillColor: '#eeeeee',
          alignment: 'center',
        },
        {
          text: '\nCOMPETENCIAS',
          style: 'tableHeader',
          rowSpan: 2,
          fillColor: '#eeeeee',
        },
        {
          text: 'BIMESTRE',
          style: 'tableHeader',
          colSpan: 4,
          fillColor: '#eeeeee',
        },

        {},
        {},
        {},
        // {
        //   text: 'EVAL. RECUP.',
        //   style: 'tableHeader',
        //   rowSpan: 2,

        //   fillColor: '#eeeeee',
        // },
        // {
        //   text: 'VALORACIÓN DESCRIPTIVA DEL ÁREA',
        //   style: 'tableHeader',
        //   rowSpan: 2,
        //   fillColor: '#eeeeee',
        //   fontSize: 7,
        // },
      ],
      [
        {}, // ÁREA (rowSpan)
        {}, // copetencias (rowSpan)
        { text: 'I', style: 'tableHeader' },
        { text: 'II', style: 'tableHeader' },
        { text: 'III', style: 'tableHeader' },
        { text: 'IV', style: 'tableHeader' },
        // {}, // EVAL. RECUP. (rowSpan)
        // {}, // EVAL. RECUP. (rowSpan)
      ],
    ];

    // Filas de datos
    reportData.areas.forEach((area) => {
      area.competencies.forEach((competency, index) => {
        const row = [
          index === 0
            ? { text: area.name, rowSpan: area.competencies.length }
            : {},
          { text: competency.name },
          ...competency.grades.map((grade) => ({ text: grade })),

          // { rowSpan: area.competencies.length, text: '' }, // Eval. Recup. (vacío por defecto)
          // { rowSpan: area.competencies.length, text: '' }, // VALORACIÓN DESCRIPTIVA DEL ÁREA
        ];

        tableBody.push(row);
      });
    });

    return {
      style: 'tableExample',
      color: '#444',
      fontSize: 7,
      table: {
        headerRows: 8,
        keepWithHeaderRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody,
      },
      // layout: {
      //   hLineWidth: (i, node) =>
      //     i === 0 || i === 1 || i === node.table.body.length ? 1 : 0,
      //   vLineWidth: (i, node) => 0,
      //   paddingTop: (i, node) => 4,
      //   paddingBottom: (i, node) => 4,
      // },
      margin: [0, 5, 0, 15],
    };
  }

  private createAttendanceTable(reportData: any): Content {
    if (!reportData.attendance) {
      return { text: '' };
    }

    return {
      color: '#444',
      fontSize: 6,
      table: {
        widths: [
          '*',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          '*',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
        ],
        body: [
          [
            {
              text: 'ASISTENCIAS Y TARDANZAS',
              style: 'tableHeader',
              colSpan: 6,
              fillColor: '#eeeeee',
            },
            {},
            {},
            {},
            {},
            {},
            {
              text: 'CONDUCTA',
              style: 'tableHeader',
              colSpan: 6,
              fillColor: '#eeeeee',
            },
            {},
            {},
            {},
            {},
            {},
          ],
          [
            { text: 'TIPO', style: 'tableHeader' },
            { text: 'I', style: 'tableHeader' },
            { text: 'II', style: 'tableHeader' },
            { text: 'III', style: 'tableHeader' },
            { text: 'IV', style: 'tableHeader' },
            { text: 'TOTAL', style: 'tableHeader' },
            { text: 'BIMESTRE', style: 'tableHeader' },
            { text: 'I', style: 'tableHeader' },
            { text: 'II', style: 'tableHeader' },
            { text: 'III', style: 'tableHeader' },
            { text: 'IV', style: 'tableHeader' },
            { text: 'N.F.', style: 'tableHeader' },
          ],
          [
            'Tardanza Injustificada',
            ...reportData.attendance.tardinessUnjustified.map((t) =>
              t.toString(),
            ),
            '',
            { text: 'NOTA', fontSize: 8, alignment: 'center' },
            '',

            '',
            '',
            '',
            '',
          ],
          [
            'Tardanza Justificada',
            ...reportData.attendance.tardinessJustified.map((t) =>
              t.toString(),
            ),
            '',
            { rowSpan: 3, text: '', colSpan: 6 },
            {},
            {},
            {},
            {},
            {},
          ],
          [
            'Falta Injustificada',
            ...reportData.attendance.absenceUnjustified.map((a) =>
              a.toString(),
            ),
            '',
            {},
            {},
            {},
            {},
            {},
            {},
          ],
          [
            'Falta Justificada',
            ...reportData.attendance.absenceJustified.map((a) => a.toString()),
            '',
            {},
            {},
            {},
            {},
            {},
            {},
          ],
        ],
      },
      // layout: 'lightHorizontalLines',
    };
  }

  async generateSchoolReport(reportData: any): Promise<Buffer> {
    const url = this.configService.getOrThrow('AWS_URL_BUCKET');
    const logoUrl = `${url}recursos/logo-ae-completo.png`;
    const studentPhotoURL = `https://caebucket.s3.us-west-2.amazonaws.com/colegio/${reportData.studentPhoto}`;
    const firmaDirectorURL = `${url}recursos/firma-director.png`;
    const logo = await this.fetchImage(logoUrl);
    const firmaDirectorBuff = await this.fetchImage(firmaDirectorURL);
    const studentBuffer = await this.fetchImage(studentPhotoURL);
    const studentPhoto = await this.convertWebPToPNG(studentBuffer);
    // const firmaDirector = await this.convertWebPToPNG(firmaDirectorBuff);
    try {
      const docDefinition: TDocumentDefinitions = {
        // watermark: {
        //   text: 'TEST REPORT',
        //   color: 'blue',
        //   opacity: 0.1,
        //   bold: true,
        //   italics: false,
        // },
        content: [
          ...this.createHeader(logo, studentPhoto),
          { text: '\n' },
          {
            text: `INFORME DE LOS PROCESOS DEL EDUCANDO - ${reportData.year} \nNIVEL ${reportData.level}`,
            alignment: 'center',
            fontSize: 14,
            // font: 'Courier-Bold',
            bold: true,
            color: '#0045AA',
          },
          { text: '\n' },
          this.createStudentInfo(reportData),
          { text: '\n' },
          this.createAreasTable(reportData),
          // { text: '\n' },
          // this.createAttendanceTable(reportData),
          // { text: '\n' },
          {
            style: 'tableExample',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: 'COMENTARIOS DEL TUTOR',
                    fillColor: '#eeeeee',
                    style: 'tableHeader',
                  },
                ],
                [
                  {
                    text: '\n\n\n\n',
                  },
                ],
              ],
            },
          },
          // { text: '\n' },
          // { text: '\n' },
          // { text: '\n' },
          {
            margin: [0, 40, 0, 0], // Espacio arriba del bloque de firmas
            columns: [
              // Columna izquierda (Firma tutor)
              {
                width: '50%',
                stack: [
                  {
                    text: '______________________________', // Línea para firma
                    alignment: 'center',
                  },
                  {
                    text: 'TUTOR(A)',
                    bold: true,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 5, 0, 0], // Espacio entre línea y texto
                  },
                ],
              },
              // Columna derecha (Firma director)
              {
                width: '50%',
                stack: [
                  {
                    image: firmaDirectorBuff as any,
                    width: 140,
                    height: 40,
                    alignment: 'center',
                  },
                  // {
                  //   text: 'DIRECTOR(A)',
                  //   alignment: 'right',
                  //   margin: [0, 5, 0, 0], // Espacio entre imagen y texto
                  // },
                ],
              },
            ],
            // columnGap: 250, // Espacio entre columnas
          },

          // {
          //   qr: 'text in QR',
          //   fit: 80,
          //   alignment: 'right',
          // },
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: 'center',
          },
          subheader: {
            fontSize: 10,
            bold: true,
            alignment: 'center',
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            alignment: 'center',
          },
          areaTitle: {
            fontSize: 10,
            bold: true,
            decoration: 'underline',
            margin: [0, 10, 0, 5],
          },
          commentsTitle: {
            bold: true,
            decoration: 'underline',
            margin: [0, 20, 0, 5],
          },
        },
        defaultStyle: {
          fontSize: 8,
          margin: [0, 2, 0, 2],
        },
      };

      return new Promise<Buffer>((resolve) => {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
          resolve(Buffer.from(buffer)); // <-- Convertir a Buffer de Node.js
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
