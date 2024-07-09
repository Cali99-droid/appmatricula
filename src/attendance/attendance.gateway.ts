// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { Logger } from '@nestjs/common';

// // @WebSocketGateway({
// //   cors: {
// //     origin: '*', // Ajusta esto según tus necesidades de CORS
// //     methods: ['GET', 'POST'],
// //   },
// // })
// export class AttendanceGateway {
//   // implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
//   // @WebSocketServer()
//   // server: Server;
//   // private logger: Logger = new Logger('AttendanceGateway');
//   // afterInit(server: Server) {
//   //   this.logger.log('Initialized');
//   // }
//   // handleConnection(client: Socket) {
//   //   this.logger.log(`Client connected: ${client.id}`);
//   // }
//   // handleDisconnect(client: Socket) {
//   //   this.logger.log(`Client disconnected: ${client.id}`);
//   // }
//   // emitLastFiveAttendances(attendances: any) {
//   //   this.server.emit('lastFiveAttendances', attendances);
//   // }
// }
