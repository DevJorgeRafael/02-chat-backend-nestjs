import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async createUser(createUserDTO: CreateUserDto): Promise<User | null> {
        const user = new this.userModel(createUserDTO);
        return user.save();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
    }

    async updateOnlineStatus(userId: string, isOnline: boolean): Promise<User | null> {
        return await this.userModel.findByIdAndUpdate(
            userId, 
            { online: isOnline },
            { new: true } // Retornar el documento actualizado
        );
    }
}
