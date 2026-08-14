import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import e from "express";
import { User } from "./user.entity";
import { Transform } from "class-transformer";
import { SafeUserDto } from "src/auth/auth.dto";

export class CreateUserDto {
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;
}

export class FindAllParams {
    @IsNumber()
    round: number;

    @IsNumber()
    count: number;

    @IsString()
    search: string;
}

export class FindOneParams {
    @IsNumberString()
    id: string;
}

export class FindAllResponse {
    users: SafeUserDto[];
    more: boolean;
}

export class ChangeUsernameDto {
    @IsNumberString()
    id: string;

    @IsNotEmpty()
    username: string;
}

export class SingleUserResponse {
    user: SafeUserDto
}

export class ChangePasswordDto {
    @IsNumberString()
    readonly id: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    readonly newPassword: string;
}