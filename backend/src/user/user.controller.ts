import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto, FindAllParams, FindAllResponse, FindOneParams } from "./user.dto.params";

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService
    ) {}

    @Get("getall")
    findAll(@Param() params: FindAllParams): Promise<FindAllResponse> {
        return this.service.findAll(params);
    }

    @Get('getone/:id')
    findOne(@Param() params: FindOneParams): Promise<User | null> {
        return this.service.findOne(params.id);
    }

    @Post('add')
    addUser(@Body() userDto: CreateUserDto): Promise<User> {
        return this.service.addOne(userDto);
    }
}