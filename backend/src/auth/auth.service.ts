import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthInput, AuthResult, SafeUserDto, SignInData, SignInInput } from "./auth.dto";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
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
        const res = await this.userService.findOneByEmail(input.email);

        if (!res.user) {
            throw new NotFoundException('user not found');
        }

        const matching = await bcrypt.compare(input.password, res.user.password)

        if (matching) {
            return {
               userId: res.user.id,
               username: res.user.username
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
            createdAt: db_res.user.createdAt
        }

        return {
            accessToken: accessToken,
            user: safeUser
        };
    }

    async signIn(user: SignInInput): Promise<AuthResult> {
        const existing = await this.userService.findOneByEmail(user.email);
        if (existing) {
            throw new ConflictException();
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
}