import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-strategy") {
    constructor(
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: (req: Request) => req.cookies.refreshToken,
            ignoreExpiration: false,
            secretOrKey: process.env.REFRESH_JWT_SECRET,
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: { sub: string, username: string }) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

        const userId = payload.sub;
        
        await this.authService.validateRefreshToken(userId, refreshToken);
        
        return { 
            userId: payload.sub,
            username: payload.username 
        };
    }
}