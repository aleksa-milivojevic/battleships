import { Module } from "@nestjs/common";
import { AuthController } from "./auth.contoller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategy/local.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import jwtConfig from "./config/jwt.config";
import refreshJwtConfig from "./config/refresh-jwt.config";
import { RefreshJwtStrategy } from "./strategy/refresh-jwt.strategy";

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        UserModule,
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(refreshJwtConfig),
        PassportModule
    ]
})
export class AuthModule {}