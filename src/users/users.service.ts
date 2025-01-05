import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './interfaces/user-document.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async createUser(createUserDTO: CreateUserDto): Promise<UserDocument | null> {
        const user = new this.userModel(createUserDTO);
        return user.save();
    }

    async findById(id: string): Promise<UserDocument | null> {
        const user = await this.userModel.findById(id);
        return user ? (user.toObject() as UserDocument) : null;
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ email });
        return user || null;
    }

    async updateOnlineStatus(userId: string, isOnline: boolean): Promise<UserDocument | null> {
        const user = await this.userModel.findByIdAndUpdate(
            userId, 
            { online: isOnline },
            { new: true } // Retornar el documento actualizado
        );
        return user ? (user.toObject() as UserDocument) : null;
    }

    async findAll(userId: string): Promise<UserDocument[]> {
        const users = await this.userModel.find(
            { _id: { $ne: userId } }, // Excluir al usuario actual
            { password: 0 }
        );
        return users.map(user => user.toJSON() as UserDocument);
    }
}
