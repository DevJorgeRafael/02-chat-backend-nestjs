import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get('/:idFrom')
    async getChat(@Req() req, @Param('idFrom') idFrom: string) {
        const userId = req.user.uid;
        const messages = await this.messagesService.getLast30Messages(userId, idFrom);
        return {
            ok: true,
            messages
        };
    } 
}
