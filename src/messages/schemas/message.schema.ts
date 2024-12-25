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

    @Prop({ required: true })
    message: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject() as any;
    return object;
})