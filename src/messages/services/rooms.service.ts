import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "../schemas/room.schema";
import { Model } from "mongoose";

@Injectable()
export class RoomsService {
    constructor(
        @InjectModel(Room.name) private readonly roomModel: Model<Room>
    ) { }

    async createRoom(name: string, members: string[]): Promise<any> {
        const room = new this.roomModel({ name, members });
        const savedRoom = await room.save();
        return this.getRoomById(savedRoom.id);
    }

    async getRoomById(roomId: string): Promise<any> {
        const populatedRoom = await this.roomModel
            .findById(roomId)
            .populate('members')
            .exec();

        const membersWithTransform = populatedRoom.members.map(member => member.toJSON());
        return { ...populatedRoom.toJSON(), members: membersWithTransform };
    }

    async getRoomsForUser(userId: string): Promise<any[]> {
        const rooms = await this.roomModel
            .find({ members: userId })
            .populate('members')
            .exec();

        return rooms.map(room => {
            const membersWithTransform = room.members.map(member => member.toJSON());
            return { ...room.toJSON(), members: membersWithTransform };
        });
    }
}