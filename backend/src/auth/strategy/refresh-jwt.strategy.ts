import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-strategy") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.REFRESH_JWT_SECRET
        });
    }

    async validate(payload: { sub: string, username: string }) {
        return { 
            userId: payload.sub,
            username: payload.username 
        };
    }
}