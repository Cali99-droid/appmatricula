import { Global, Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { ConfigModule } from '@nestjs/config';

@Global() // ¡Esto hace que el módulo sea global!
@Module({
  imports: [ConfigModule], // Importa las dependencias que el servicio necesita
  providers: [SlackService],
  exports: [SlackService], // Exporta el servicio para que sea inyectable
})
export class SlackModule {}
