import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-token'];

    if (!token) {
        throw new UnauthorizedException('Missing token');
    }

    try {
        const decoded = this.jwtService.verify(token, { secret: process.env.JWT_KEY });
        request.user = decoded;
        return true;
    } catch (error) {
        throw new UnauthorizedException('Invalid token');
    }

  }
}