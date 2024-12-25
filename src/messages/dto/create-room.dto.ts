import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty({ message: 'Room name is required' })
    name: string;

    @IsArray()
    @IsNotEmpty({ message: 'Room members are required' })
    members: string[];
}