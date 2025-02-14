import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GridFsService } from 'src/messages/services/gridfs.service';
import { MessagesService } from 'src/messages/services/messages.service';
import { UsersService } from 'src/users/users.service';
import { DateTime } from 'luxon';
import { from } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly gridFsService: GridFsService,
  ) {}

  async handleConnection(client: any, ...args: any[]): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`); 
    
    const token = client.handshake.headers['x-token'] as string;
    if (!token) {
      this.logger.warn('Missing token');
      client.disconnect();
      return;
    }

    const { valid, uid } = await this.authService.verifyToken(token);
    if (!valid || !uid ) {
      this.logger.warn('Invalid token');
      client.disconnect();
      return;
    }

    const user = await this.usersService.updateOnlineStatus(uid, true);
    if (!user) {
      this.logger.warn(`User not found for UID: ${uid}}`);
      client.disconnect();
      return;
    }

    client.data.uid = uid;
    client.join( uid );

    this.logger.log(`User ${uid} connected`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
      this.logger.log(`User ${client.id} disconnected`);

      const uid = client.data.uid;
      if (uid) {
        await this.usersService.updateOnlineStatus(uid, false);
        this.logger.log(`User ${uid} disconnected`);
        client.leave(uid);
      }
  }

  @SubscribeMessage('mensaje-personal')
  async handlePersonalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      from: string;
      to: string;
      message?: string;
      type: string;
    },
  ) {
    const uid = client.data.uid;
    if (!uid) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const isMessageSaved = await this.messagesService.saveMessage({
      from: uid,
      to: payload.to,
      message: payload.message,
      type: payload.type,
    });

    if (!isMessageSaved) {
      client.emit('error', { message: 'Error saving message' });
      return;
    }

    client.to(payload.to).emit('mensaje-personal', {
      from: uid,
      to: payload.to,
      message: payload.message || null,
      type: payload.type,
      createdAt: DateTime.now().setZone('America/Guayaquil').toISO(),
      updatedAt: DateTime.now().setZone('America/Guayaquil').toISO(),
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }


  @SubscribeMessage('webrtc-offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      to: string;
      offer: any;
    }
  ) {
    const uid = client.data.uid;
    if (!uid) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.logger.log(`Enviado oferta de WebRTC de ${uid} a ${payload.to}`);

    // Envío la oferta al destinatario
    client.to(payload.to).emit('webrtc-offer', {
      from: uid,
      offer: payload.offer,
    })
  }

  @SubscribeMessage('webrtc-answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { to: string; answer: any }
  ) {
    const uid = client.data.uid;
    if(!uid) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.logger.log(`Enviado respuesta de WebRTC de ${uid} a ${payload.to}`);

    // Envío la al emisor de la oferta
    client.to(payload.to).emit('webrtc-answer', {
      from: uid,
      answer: payload.answer,
    })
  }
}
