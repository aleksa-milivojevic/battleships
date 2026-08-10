import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import e from "express";
import { User } from "./user.entity";
import { Transform } from "class-transformer";

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
    users: User[];
    more: boolean;
}

export class ChangeUsernameDto {
    id: string
    username: string
}