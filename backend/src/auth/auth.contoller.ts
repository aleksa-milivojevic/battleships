import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Req, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { PassportLocalGuard } from "./guards/passport-local.guard";
import { PassportJwtAuthGuard } from "./guards/passport-jwt.guard";
import { RawSqlResultsToEntityTransformer } from "typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer.js";
import { SignInInput } from "./auth.dto";
import { RefreshAuthGuard } from "./guards/refresh-jwt.guard";
import type { Response } from "express";

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
    async login(
        @Request() request,
        @Res({ passthrough: true }) response: Response
    ) {
        const result = await this.authService.sign(request.user);

        response.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        response.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return { user: result.user };
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        return request.user;
    }

    @Post('signin')
    async signin(
        @Body() input: {email: string, username: string, password: string},
        @Res({ passthrough: true }) response: Response
    ) {
        const result = await this.authService.signIn(input);
        
        response.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        response.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return { user: result.user };
    }

    @UseGuards(RefreshAuthGuard)
    @Post('refresh')
    async refreshToken(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        const result = await this.authService.refreshToken(req.user);

        response.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        response.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return { message: "Tokens refreshed" };
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('logout')
    logout(@Req() req) {
        this.authService.logout(req.user);
    }
}