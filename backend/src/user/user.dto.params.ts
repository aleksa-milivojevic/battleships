import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import e from "express";
import { User } from "./user.entity";

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
    readonly round: number = 1;

    @IsNumber()
    readonly count: number = 10;

    @IsString()
    readonly search: string = '';
}

export class FindOneParams {
    @IsNumberString()
    id: string;
}

export class FindAllResponse {
    users: User[];
    more: boolean;
}