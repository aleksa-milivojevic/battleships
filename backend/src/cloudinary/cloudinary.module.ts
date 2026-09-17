import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { NestCloudinaryController } from './cloudinary.controller';
import { NestCloudinaryService } from './cloudinary.service';

@Module({
    imports: [
		CloudinaryModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				isGlobal: true,
				cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
				api_key: process.env.CLOUDINARY_API_KEY,
				api_secret: process.env.CLOUDINARY_API_SECRET
			}),
			inject: [ConfigService],
		}),
	],
    controllers: [NestCloudinaryController],
    providers: [NestCloudinaryService],
    exports: [NestCloudinaryService]
})
export class NestCloudinaryModule {}