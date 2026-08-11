import { Body, Controller, Get, NotImplementedException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto, FindAllParams, FindAllResponse, FindOneParams, ChangeUsernameDto, SingleUserResponse, ChangePasswordDto } from "./user.dto.params";
import { PassportJwtAuthGuard } from "src/auth/guards/passport-jwt.guard";

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
    findOne(@Param() params: FindOneParams): Promise<SingleUserResponse> {
        return this.service.findOne(params.id);
    }

    @Post('add')
    addUser(@Body() userDto: CreateUserDto): Promise<SingleUserResponse> {
        return this.service.addOne(userDto);
    }

    @Post('chname')
    changeUsername(@Body() usernameDto: ChangeUsernameDto): Promise<SingleUserResponse> {
        return this.service.changeUsername(usernameDto);
    }

    @Post('chpass')
    changePassword(@Body() passwordDto: ChangePasswordDto): Promise<SingleUserResponse> {
        return this.service.changePassword(passwordDto);
    }
}