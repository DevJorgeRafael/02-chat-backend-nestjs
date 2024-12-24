import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(name: string, email: string, password: string) {
        const userFound = await this.usersService.findByEmail(email);
        if (userFound) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());

        const newUser = await this.usersService.createUser({
            name,
            email,
            password: hashedPassword,
        });

        const token = this.generateToken(newUser.id);
        return { user: newUser, token };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if( !user || !bcrypt.compareSync(password, user.password)) {
            throw new BadRequestException('Invalid credentials');
        }
    }

    // Renovación del token
    async renewToken(token: string) {
        const { valid, uid } = await this.verifyToken(token);

        if (!valid || !uid) {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.usersService.findById(uid);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const newToken = await this.generateToken(user.id);

        return { user, token: newToken };
    }

    async generateToken(userId: string): Promise<string> {
        return this.jwtService.signAsync(
            { uid: userId },
            { 
                secret: process.env.JWT_KEY,
                expiresIn: '24h'
            },
        )
    }

    private async verifyToken(token: string): Promise<{ valid: boolean; uid: string | null }> {
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_KEY });
            return { valid: true, uid: decoded.uid };
        } catch (error) {
            return { valid: false, uid: null };
        }
    }
}
