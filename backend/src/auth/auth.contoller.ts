import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { PassportLocalGuard } from "./guards/passport-local.guard";
import { PassportJwtAuthGuard } from "./guards/passport-jwt.guard";
import { RawSqlResultsToEntityTransformer } from "typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer.js";

@Controller('auth')
export class AuthController {
    constructor (
        private authService: AuthService
    ) {}

    // @HttpCode(HttpStatus.OK)
    // @Post('login')
    // login(@Body() input: { email: string, password: string }) {
    //     return this.authService.authenticate(input);
    // }

    // @UseGuards(AuthGuard)
    // @Get('me')
    // getUserInfo(@Request() request) {
    //     return request.user;
    // }

    @HttpCode(HttpStatus.OK)
    @Post('login2')
    @UseGuards(PassportLocalGuard)
    login2(@Request() request) {
        return this.authService.signIn(request.user);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('me2')
    getUserInfo2(@Request() request) {
        return request.user;
    }
}