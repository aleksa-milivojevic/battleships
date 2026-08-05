import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthInput, AuthResult, SignInData } from "./auth.dto";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validate(input);

        if (!user) {
            throw new UnauthorizedException();
        }

        return this.signIn(user);
    }

    async validate(input: AuthInput): Promise<SignInData | null> {
        const user = await this.userService.findOneByEmail(input.email);

        if (user && user.password === input.password) {
            return {
                userId: user.id,
                username: user.username
            }
        }
        return null;
    }

    async signIn(user: SignInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username
        }

        const accessToken = await this.jwtService.signAsync(tokenPayload);

        return {
            accessToken: accessToken,
            userId: user.userId,
            username: user.username
        };
    }
}