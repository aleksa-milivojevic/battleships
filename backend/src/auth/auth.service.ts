import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthInput, AuthResult, RefreshResponse, SafeUserDto, SignInData, SignInInput } from "./auth.dto";
import { UserService } from "src/database/user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as argon from "argon2";
import { ConfigService } from "@nestjs/config";
import type { ConfigType } from "@nestjs/config";
import refreshJwtConfig from "./config/refresh-jwt.config";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(refreshJwtConfig.KEY) private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
    ) {}

    //ne koristi se fja, preslo se na passport

    // async authenticate(input: AuthInput): Promise<AuthResult> {
    //     const user = await this.validate(input);

    //     if (!user) {
    //         throw new UnauthorizedException();
    //     }

    //     return this.sign(user);
    // }

    async validate(input: AuthInput): Promise<SignInData | null> {
        const user = await this.userService.findOneByEmailWithPassword(input.email);

        if (!user) {
            throw new NotFoundException('user not found');
        }

        const matching = await bcrypt.compare(input.password, user.password)

        if (matching) {
            return {
               userId: user.id,
               username: user.username
            }
        }
        return null;
    }

    async sign(user: SignInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username
        }

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        const refreshToken = await this.jwtService.signAsync(tokenPayload, this.refreshTokenConfig);

        await this.userService.updateRefreshToken(user.userId, refreshToken);

        const db_res = await this.userService.findOne(user.userId);
        if (!db_res.user) throw new NotFoundException('user not found in sign');

        const safeUser: SafeUserDto = {
            id: db_res.user.id,
            email: db_res.user.email,
            username: db_res.user.username,
            admin: db_res.user.admin,
            score: db_res.user.score,
            banned: db_res.user.banned,
            timeout: db_res.user.timeout,
            createdAt: db_res.user.createdAt,
            online: db_res.user.online
        }

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser
        };
    }

    async signIn(user: SignInInput): Promise<AuthResult> {
        const existingEmail = await this.userService.checkExistingEmail(user.email);
        const existingUsername = await this.userService.checkExistingUsername(user.username);
        if (existingEmail) {
            throw new ConflictException('email already in use');
        }
        if (existingUsername) {
            throw new ConflictException('username already in use');
        }
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

        const salt = await bcrypt.genSalt(saltRounds);

        var hashed = await bcrypt.hash(user.password, salt);

        console.log(hashed);

        if (!hashed) {
            throw new InternalServerErrorException('bcrypt failed');
        }

        const res = await this.userService.addOne({
            email: user.email,
            username: user.username,
            password: hashed
        })

        if (!res.user) {
            throw new InternalServerErrorException('creating user failed');
        }

        return await this.sign({
            userId: res.user.id,
            username: res.user.username
        });
    }

    async refreshToken(user: SignInData): Promise<RefreshResponse> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username
        }

        const accessToken = await this.jwtService.signAsync(tokenPayload);
        const refreshToken = await this.jwtService.signAsync(tokenPayload, this.refreshTokenConfig);

        await this.userService.updateRefreshToken(user.userId, refreshToken);

        return { 
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    }

    async validateRefreshToken(id: string, refreshToken: string) {
        const user = await this.userService.findOneWithToken(id);
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('invalid refresh token');
        }

        const matching = await argon.verify(user.refreshToken, refreshToken);
        console.log(matching);

        if (!matching) {
            throw new UnauthorizedException('invalid refresh token');
        }

        return true;
    }

    async logout(user: SignInData) {
        await this.userService.updateRefreshToken(user.userId, null);
        await this.userService.setOffline(user.userId);
    }
}