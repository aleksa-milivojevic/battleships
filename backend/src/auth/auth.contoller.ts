import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Req, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { PassportLocalGuard } from "./guards/passport-local.guard";
import { PassportJwtAuthGuard } from "./guards/passport-jwt.guard";
import { RawSqlResultsToEntityTransformer } from "typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer.js";
import { SignInInput } from "./auth.dto";
import { RefreshAuthGuard } from "./guards/refresh-jwt.guard";

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
    @Post('login')
    @UseGuards(PassportLocalGuard)
    login(@Request() request) {
        return this.authService.sign(request.user);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        return request.user;
    }

    @Post('signin')
    signin(@Body() input: {email: string, username: string, password: string}) {
        return this.authService.signIn(input);
    }

    @UseGuards(RefreshAuthGuard)
    @Get('refresh')
    refreshToken(@Req() req) {
        return this.authService.refreshToken(req.user);
    }
}