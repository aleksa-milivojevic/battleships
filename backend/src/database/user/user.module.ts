import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { NestCloudinaryModule } from "src/cloudinary/cloudinary.module";
import { NestMailerModule } from "src/mailer/mailer.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), NestCloudinaryModule, NestMailerModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}