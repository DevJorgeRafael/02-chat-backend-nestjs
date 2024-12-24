import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class User extends Document {
    id: string;

    @Prop({ required: true })
    name: string

    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop({ default: false, })
    online: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject() as any;
    return { ...object, id: _id };
})
