import { Body, Controller, Get, NotImplementedException, Param, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto, FindAllParams, FindAllResponse, FindOneParams, ChangeUsernameDto, SingleUserResponse } from "./user.dto.params";

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService
    ) {}

    @Get("getall")
    findAll(@Query() params: FindAllParams): Promise<FindAllResponse> {
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

    @Post('chname')
    changeUsername(@Body() usernameDto: ChangeUsernameDto): Promise<SingleUserResponse> {
        return this.service.changeUsername(usernameDto);
    }
}