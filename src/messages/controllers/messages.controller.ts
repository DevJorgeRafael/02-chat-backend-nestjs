import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { MessagesService } from '../services/messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GridFsService } from '../services/gridfs.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly gridFsService: GridFsService
    ) { }

    // Endpoint para listar todos los archivos
    @Get('files')
    async getFiles(@Res() res: Response) {
        try {
            const files = await this.gridFsService.getAllFiles();
            res.status(200).json({
                ok: true,
                files
            });
        } catch (error) {
            console.error(`Error retrieving files: ${error.message}`);
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

    // Endpoint para obtener un archivo por ID
    @Get('file/:id')
    async getFile(@Param('id') id: string, @Res() res: Response) {
        try {
            const { file, readStream } = await this.gridFsService.getFile(id);
            res.set({
                'Content-Type': file.contentType,
                'Content-Disposition': `inline; filename="${file.filename}"`,
            });

            readStream.pipe(res); // Enviar archivo como stream
        } catch (error) {
            console.error(`Error retrieving file: ${error.message}`);
            res.status(404).send({ error: 'File not found' });
        }
    }

    // Endpoint para obtener los últimos 30 mensajes entre dos usuarios
    @Get('/:idFrom')
    async getChat(@Req() req, @Param('idFrom') idFrom: string) {
        const userId = req.user.uid;
        const messages = await this.messagesService.getLast30Messages(userId, idFrom);
        return {
            ok: true,
            messages
        };
    }

    // Endpoint para subir archivos
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { from: string; to: string; type: string }
    ) {
        if (!file) throw new Error('No file uploaded');

        const savedMessage = await this.messagesService.saveMessage({
            from: body.from,
            to: body.to,
            type: body.type,
            fileBuffer: file.buffer,
            fileName: file.originalname,
            mimeType: file.mimetype,
        });

        return savedMessage;
    }
}
