import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AttendanceService } from './attendance.service';
import { User } from 'src/user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // Cambia '*' por el dominio específico si es necesario
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
})
export class AttendanceGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly attendanceService: AttendanceService) {}

  @SubscribeMessage('requestLastFiveRecords')
  async handleRequestLastFiveRecords(
    @MessageBody() user: User,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const records = await this.attendanceService.findLastFiveRecords(user);
      client.emit('lastFiveRecords', records);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
