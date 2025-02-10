import { Module } from '@nestjs/common';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsController } from './controllers/rooms.controller';
import { RoomsService } from './services/rooms.service';
import { Room, RoomSchema } from './schemas/room.schema';
import { GridFsService } from './services/gridfs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema},
      { name: Room.name, schema: RoomSchema },
    ]),
   
    AuthModule,
  ],
  controllers: [MessagesController, RoomsController],
  providers: [MessagesService, RoomsService, GridFsService],
  exports: [MessagesService, RoomsService, GridFsService]
})
export class MessagesModule {}
