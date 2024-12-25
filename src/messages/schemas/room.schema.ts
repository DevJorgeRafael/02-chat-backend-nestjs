import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema()
export class Room extends Document {
    @Prop({ required: true })
    name: string;
    
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    members: mongoose.Types.ObjectId[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject() as any;
    object.id = _id;
    return object;
})