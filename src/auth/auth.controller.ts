import { Body, Controller, Get, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: RegisterUserDto) {
        const { name, email, password } = body;
        console.log(body); 
        return this.authService.register(name, email, password);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: LoginDto) {
        const { email, password } = body;
        return this.authService.login(email, password);
    }

    @Get('renew')
    @UseGuards(JwtAuthGuard)
    async renewToken(@Headers() token: string) {
        return this.authService.renewToken(token);
    }

}