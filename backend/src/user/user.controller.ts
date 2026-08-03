import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { UserDto } from "./user.dto";

@Controller()
export class UserController {
    constructor(
        private readonly service: UserService
    ) {}

    @Get("getall")
    findAll(): Promise<User[]> {
        return this.service.findAll();
    }

    @Post('add')
    addUser(@Body() userDto: UserDto): Promise<User> {
        return this.service.addOne(userDto);
    }
}