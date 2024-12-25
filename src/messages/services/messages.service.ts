import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>
    ) {}

    async createMessage(data: any): Promise<Message> {
        const message = new this.messageModel(data);
        return message.save();
    }

    async saveMessage(payload: { from: string; to: string; message: string }): Promise<boolean> {
        try {
            const message = new this.messageModel(payload);
            await message.save();
            return true;
        } catch (error) {
            console.error('Failed to save message:', error);
            return false;
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
