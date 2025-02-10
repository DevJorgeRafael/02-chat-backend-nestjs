import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';
import { GridFsService } from './gridfs.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        private readonly gridFsService: GridFsService,
    ) {}

    async createMessage(payload: { from: string; to: string; message?: string; type: string; fileId?: string }): Promise<Message> {
        const message = new this.messageModel(payload);
        return message.save();
    }

    async saveMessage(payload: {
        from: string;
        to: string;
        message?: string;
        type: string;
        fileBuffer?: Buffer;
        fileName?: string;
        mimeType?: string;
    }): Promise<Message | null> {
        try {
            let fileId: string | undefined;

            if (payload.fileBuffer && payload.fileName && payload.mimeType) {
                fileId = await this.gridFsService.uploadFile(payload.fileBuffer, payload.fileName, payload.mimeType);
            }

            const messagePayload: any = {
                from: payload.from,
                to: payload.to,
                // message: payload.message ?? "",
                type: payload.type,
                fileId,
            };

            if(payload.message) {
                messagePayload.message = payload.message;
            }

            return await this.createMessage(messagePayload);
        } catch (error) {
            console.error("Error saving message:", error);
            return null;
        }
    }


    async getAllMessages(): Promise<Message[]> {
        return this.messageModel.find().populate('from').populate('to').exec();
    } 

    async getMessagesByUserId(userId: string): Promise<Message[]> {
        return this.messageModel.find({ $or: [{ from: userId }, { to: userId }] }).populate('from').populate('to').exec();
    }

    async getLast30Messages(userId: string, fromId: string): Promise<Message[]> {
        
        return this.messageModel. find({
            $or: [
                { from: userId, to: fromId },
                { from: fromId, to: userId }
            ]
        })
        .sort({ createdAt: 'desc' })
        .limit(30)
        .exec();
    }

    async deleteMessage(id: string): Promise<Message> {
        return this.messageModel.findByIdAndDelete(id).exec();
    }
}
