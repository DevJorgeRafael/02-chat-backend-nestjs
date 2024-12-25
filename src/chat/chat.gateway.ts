import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { MessagesService } from 'src/messages/services/messages.service';
import { UsersService } from 'src/users/users.service';

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
    @MessageBody() payload: { from: string; to: string; message: string },
  ) {
    const uid = client.data.uid;
    if (!uid) {
      client.emit('error', { message: 'unauthorized' });
      return;
    }

    const isMessageSaved = await this.messagesService.saveMessage({
      from: uid,
      to: payload.to,
      message: payload.message,
    })

    if (!isMessageSaved) {
      this.logger.error('Failed to save message');
      return;
    }

    client.to(payload.to).emit('mensaje-personal', payload);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
