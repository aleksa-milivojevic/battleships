import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthInput, AuthResult, SignInData, SignInInput } from "./auth.dto";
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

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validate(input);

        if (!user) {
            throw new UnauthorizedException();
        }

        return this.sign(user);
    }

    async validate(input: AuthInput): Promise<SignInData | null> {
        const user = await this.userService.findOneByEmail(input.email);

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

        return {
            accessToken: accessToken,
            userId: user.userId,
            username: user.username
        };
    }

    async signIn(user: SignInInput): Promise<AuthResult> {
        const existing = await this.userService.findOneByEmail(user.email);
        if (existing) {
            throw new ConflictException();
        }
        const saltRounds = this.configService.get<number>("SALT_ROUNDS") || 10;

        const salt = await bcrypt.genSalt(saltRounds);

        var hashed = await bcrypt.hash(user.password, salt);

        console.log(hashed);

        if (!hashed) {
            throw new InternalServerErrorException('bcrypt failed');
        }

        const newUser = await this.userService.addOne({
            email: user.email,
            username: user.username,
            password: hashed
        })

        if (!newUser) {
            throw new InternalServerErrorException('creating user failed');
        }

        return await this.sign({
            userId: newUser.id,
            username: newUser.username
        });
    }
}