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
        const user = await this.userModel.findById(id);
        return user ? user.toJSON() : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userModel.findOne({ email });
        return user?.toJSON() || null; 
    }

    async updateOnlineStatus(userId: string, isOnline: boolean): Promise<User | null> {
        const user = await this.userModel.findByIdAndUpdate(
            userId, 
            { online: isOnline },
            { new: true } // Retornar el documento actualizado
        );
        return user ? user.toJSON() : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find();
        return users.map(user => user.toJSON());
    }
}
