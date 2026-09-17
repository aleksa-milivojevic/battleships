import { Body, Controller, Delete, NotImplementedException, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'nestjs-cloudinary';
import { PassportJwtAuthGuard } from 'src/auth/guards/passport-jwt.guard';

@Controller()
export class NestCloudinaryController {

    constructor(private readonly cloudinaryService: CloudinaryService ) {}
    
    @UseGuards(PassportJwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        throw new NotImplementedException();
    }

    @UseGuards(PassportJwtAuthGuard)
    @Delete('delete')
    delete(@Body('pictureId') id: string) {
        throw new NotImplementedException();
    }
}