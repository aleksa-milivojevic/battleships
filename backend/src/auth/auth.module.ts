import { Module } from "@nestjs/common";
import { AuthController } from "./auth.contoller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }
        })
    ]
})
export class AuthModule {}