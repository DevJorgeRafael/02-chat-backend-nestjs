import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({
    timestamps: true,
})
export class Message extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    from: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    to: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room' })
    room: string;

    @Prop()
    message?: string;

    @Prop({ type: String, enum: ['text', 'video', 'image', 'file'], required: true })
    type: string;

    @Prop()
    fileId?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject() as any;
    return object;
})