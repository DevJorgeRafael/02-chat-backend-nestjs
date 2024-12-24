import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ChatGateway implements, OnGateWa {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
