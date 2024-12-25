import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoomsService } from "../services/rooms.service";
import { Room } from "../schemas/room.schema";
import { CreateRoomDto } from "../dto/create-room.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";


@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Post()
    async createRoom(@Req() req, @Body() createRoomDto: CreateRoomDto): Promise<Room> {
        const userId = req.user.uid;
        const members = [...createRoomDto.members, userId];
        return this.roomsService.createRoom(createRoomDto.name, members);
    }

    @Get(':roomId')
    async getRoomById(@Param('roomId') roomId: string): Promise<Room> {
        return this.roomsService.getRoomById(roomId);
    }

    @Get()
    async getRoomsForUser(@Req() req): Promise<Room[]> {
        const userId = req.user.uid;
        return this.roomsService.getRoomsForUser(userId);
    }
}