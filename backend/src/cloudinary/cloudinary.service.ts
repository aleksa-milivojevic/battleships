import { Injectable } from "@nestjs/common";
import { CloudinaryService } from "nestjs-cloudinary";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class NestCloudinaryService {

    constructor(
        private cloudinaryService: CloudinaryService
    ) {}

    async upload(file: Express.Multer.File, options = {}): Promise<UploadApiResponse | undefined> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinaryService.cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(file.buffer);
        });
    }

    async delete(id: string) {
        try {
            await this.cloudinaryService.cloudinary.uploader.destroy(id);
        }
        catch (error) {
            console.error('Cloudinary delete greska', error);
        }
    }
}