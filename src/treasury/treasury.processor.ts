// src/modules/cobranza/cobranza.processor.ts
import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SlackChannel } from 'src/common/slack/slack.constants';
import { SlackService } from 'src/common/slack/slack.service';
import { SlackBlock } from 'src/common/slack/types/slack.types';
import { PdfService } from 'src/docs/pdf.service';
import { EmailsService } from 'src/emails/emails.service';
import { TreasuryService } from './treasury.service';

export interface CobranzaJobData {
  estudianteData: any;
  enviarEmail: boolean;
  jobId: string;
}

export interface CobranzaJobResult {
  estudianteId: string;
  nombreEstudiante: string;
  nombreApoderado: string;
  codigoDocumento: string;
  s3Url?: string;
  emailEnviado: boolean;
  error?: string;
}

@Processor('cobranza')
export class CobranzaProcessor {
  private readonly logger = new Logger(CobranzaProcessor.name);

  constructor(
    private readonly pdfService: PdfService,

    private readonly emailService: EmailsService,

    private readonly slackService: SlackService,
    private readonly treasuryService: TreasuryService,
  ) {}

  /**
   * Procesa el job de generación de cartas
   */
  @Process('generar-cartas')
  async procesarCobranza(job: Job<CobranzaJobData>) {
    const { estudianteData, enviarEmail, jobId } = job.data;
    const startTime = Date.now();
    console.log('chambiando');
    this.logger.log(
      `[Job ${jobId}] Iniciando procesamiento de ${estudianteData.length} estudiantes`,
    );

    const resultados: CobranzaJobResult[] = [];
    const errores: Array<{ estudiante: string; error: string }> = [];

    // Actualizar progreso a 0%
    await job.progress(0);

    for (let i = 0; i < estudianteData.length; i++) {
      const student = estudianteData[i];

      try {
        const debtsStudent = await this.treasuryService.searchDebtsByDate(
          student.studentId,
        );
        const resultado = await this.procesarEstudiante(
          student,
          enviarEmail,
          debtsStudent,
        );
        resultados.push(resultado);

        if (resultado.error) {
          errores.push({
            estudiante: resultado.nombreEstudiante,
            error: resultado.error,
          });
        }

        // Actualizar progreso
        const progress = Math.round(((i + 1) / estudianteData.length) * 100);
        await job.progress(progress);

        this.logger.log(
          `[Job ${jobId}] Progreso: ${progress}% (${i + 1}/${estudianteData.length})`,
        );

        // Pequeña pausa para no saturar SMTP
        if (enviarEmail && i < estudianteData.length - 1) {
          await this.delay(1000); // 1 segundo entre emails
        }
      } catch (error) {
        this.logger.error(
          `[Job ${jobId}] Error en estudiante ${student}: ${error.message}`,
        );

        resultados.push({
          estudianteId: student.student,
          nombreEstudiante: 'Desconocido',
          nombreApoderado: 'Desconocido',
          codigoDocumento: '',
          emailEnviado: false,
          error: error.message,
        });

        errores.push({
          estudiante: student.student,
          error: error.message,
        });
      }
    }

    const duracionSegundos = Math.round((Date.now() - startTime) / 1000);
    const exitosos = resultados.filter((r) => !r.error).length;
    const emailsEnviados = resultados.filter((r) => r.emailEnviado).length;

    // Enviar resumen a Slack
    await this.slackService.enviarResumenCobranza(
      {
        totalProcesados: resultados.length,
        exitosos,
        fallidos: resultados.length - exitosos,
        emailsEnviados,
        duracionSegundos,
        errores,
      },
      SlackChannel.TREASURY,
    );

    this.logger.log(
      `[Job ${jobId}] Completado: ${exitosos}/${resultados.length} exitosos, ` +
        `${emailsEnviados} emails enviados, ${duracionSegundos}s`,
    );

    return {
      jobId,
      resultados,
      resumen: {
        total: resultados.length,
        exitosos,
        fallidos: resultados.length - exitosos,
        emailsEnviados,
        duracionSegundos,
      },
    };
  }

  /**
   * Procesa un estudiante individual
   */
  private async procesarEstudiante(
    studentData: any,
    enviarEmail: boolean,
    debts: any[],
  ): Promise<CobranzaJobResult> {
    // Generar código único
    const codigoDocumento = this.generarCodigoDocumento(studentData.code);

    // Preparar datos para el PDF
    const dataPdf = {
      fecha: new Date(),
      apoderado: studentData.parent,
      estudiante: studentData.student,
      grado: studentData.grade,
      montoDeuda: Number(studentData.total),
      detalleDeuda: 'Monto total adeudado hasta la fecha ',
      codigoDocumento,
      debts,
      contract: studentData.contract,
    };

    // Generar PDF en memoria (Buffer)
    const pdfBuffer = await this.pdfService.generarCartaFinalBuffer(dataPdf);

    this.logger.log(
      `PDF generado en memoria para ${studentData.student}: ${pdfBuffer.length} bytes`,
    );

    let s3Url: string | undefined;
    let emailEnviado = false;

    // Enviar email si se solicita
    if (enviarEmail && studentData.email) {
      try {
        // Opción B: Enviar con Buffer adjunto (sin guardar)
        emailEnviado = await this.emailService.enviarCartaFinalConBuffer(
          studentData.email,
          studentData.parent,
          studentData.student,

          pdfBuffer,
          codigoDocumento,
        );

        if (emailEnviado) {
          this.logger.log(`Email enviado a ${studentData.email}`);
        } else {
          this.logger.warn(`Fallo al enviar email a ${studentData.email}`);
        }
      } catch (error) {
        this.logger.error(`Error al enviar email: ${error.message}`);
      }
    }

    return {
      estudianteId: studentData.id,
      nombreEstudiante: studentData.nombreCompleto,
      nombreApoderado: studentData.apoderadoCompleto,
      codigoDocumento,
      s3Url,
      emailEnviado,
    };
  }

  /**
   * Genera un código único para el documento
   */
  private generarCodigoDocumento(estudianteId: string): string {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `COBR-${year}${month}${day}-${estudianteId}`;
  }

  /**
   * Pausa la ejecución por X milisegundos
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Se ejecuta cuando el job se completa exitosamente
   */
  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(
      `[Job ${job.data.jobId}] Completado exitosamente: ` +
        `${result.resumen.exitosos}/${result.resumen.total} exitosos`,
    );
  }

  /**
   * Se ejecuta cuando el job falla
   */
  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `[Job ${job.data.jobId}] Falló con error: ${error.message}`,
    );

    // Enviar alerta a Slack
    await this.slackService.sendMessage(
      SlackChannel.TREASURY,
      `Job de cobranza falló ${job.data.jobId}\nError: ${error.message}`,
    );
  }

  /**formatear slack */
  async enviarResumenCobranza(resumen: any): Promise<any> {
    try {
      const tasaExito =
        resumen.totalProcesados > 0
          ? ((resumen.exitosos / resumen.totalProcesados) * 100).toFixed(1)
          : '0';

      const color =
        resumen.fallidos === 0
          ? 'good'
          : resumen.fallidos > 5
            ? 'danger'
            : 'warning';

      const blocks: SlackBlock[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📧 Proceso de Cobranza Completado',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total procesados:*\n${resumen.totalProcesados}`,
            },
            {
              type: 'mrkdwn',
              text: `*Exitosos:*\n✅ ${resumen.exitosos}`,
            },
            {
              type: 'mrkdwn',
              text: `*Fallidos:*\n❌ ${resumen.fallidos}`,
            },
            {
              type: 'mrkdwn',
              text: `*Emails enviados:*\n📨 ${resumen.emailsEnviados}`,
            },
            {
              type: 'mrkdwn',
              text: `*Tasa de éxito:*\n${tasaExito}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Duración:*\n⏱️ ${resumen.duracionSegundos}s`,
            },
          ],
        },
      ];

      // Agregar sección de errores si hay
      if (resumen.errores.length > 0) {
        const erroresTexto = resumen.errores
          .slice(0, 10) // Máximo 10 errores
          .map((e) => `• *${e.estudiante}*: ${e.error}`)
          .join('\n');

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*❗ Errores encontrados (${resumen.errores.length}):*\n${erroresTexto}${
              resumen.errores.length > 10 ? '\n_...y más_' : ''
            }`,
          },
        });
      }

      // Agregar divider y footer
      blocks.push(
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `🏫 Colegio Albert Einstein | ${new Date().toLocaleString(
                'es-PE',
                {
                  timeZone: 'America/Lima',
                },
              )}`,
            },
          ],
        },
      );

      return {
        text: `Proceso de cobranza completado: ${resumen.exitosos}/${resumen.totalProcesados} exitosos`,
        blocks,
        attachments: [
          {
            color,
            text:
              resumen.fallidos === 0
                ? '✨ Proceso completado sin errores'
                : `⚠️ Revisa los ${resumen.fallidos} casos fallidos`,
          },
        ],
      };

      this.logger.log('Resumen enviado a Slack exitosamente');
    } catch (error) {
      this.logger.error(`Error al enviar mensaje a Slack: ${error.message}`);
    }
  }
}
