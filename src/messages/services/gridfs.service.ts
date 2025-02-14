import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import mongoose, { Connection } from "mongoose";
import { Readable } from "stream";
import { GridFSBucket, ObjectId, Db } from "mongodb";

@Injectable()
export class GridFsService {
    private bucket: GridFSBucket;

    constructor(@InjectConnection() private readonly connection: Connection) {
        const db = this.connection.db as unknown as Db;
        this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    }

    async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.bucket.openUploadStream(filename, {
                contentType: mimeType,
            });

            const readStream = new Readable();
            readStream.push(buffer);
            readStream.push(null);
            readStream.pipe(uploadStream);

            uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
            uploadStream.on('error', (error) => reject(error));
        })
    }

    async getFile(id: string): Promise<{ file: any; readStream: Readable }> {
        try {
            const objectId = new ObjectId(id); // Convertir el ID a ObjectId
            const cursor = this.bucket.find({ _id: objectId });

            let file: any = null;

            for await (const doc of cursor) {
                file = doc; // Asignar el archivo encontrado
                break; // Terminar el bucle después de encontrar el primer archivo
            }

            if (!file) {
                throw new Error("File not found");
            }

            const readStream = this.bucket.openDownloadStream(objectId);
            return { file, readStream }; // Retornar el archivo y el stream de lectura
        } catch (error) {
            throw new Error(error.message || "Invalid file ID format");
        }
    }

    async getAllFiles(): Promise<any[]> {
        const cursor = this.bucket.find(); // Obtener todos los archivos
        const files: any[] = [];

        for await (const file of cursor) {
            files.push({
                _id: file._id,
                filename: file.filename,
                length: file.length,
                uploadDate: file.uploadDate,
                contentType: file.contentType,
            })
        }
        return files;
    }


    async deleteFile(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const objectId = new ObjectId(id);

                this.bucket.delete(objectId).then(() => resolve()).catch(reject);
            } catch (error) {
                reject('Invalid file ID format');
            }
        });
    }
}