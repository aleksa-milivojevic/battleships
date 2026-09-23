import { Body, Controller, Delete, Get, NotImplementedException, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto, FindAllParams, FindAllResponse, FindOneParams, ChangeUsernameDto, SingleUserResponse, ChangePasswordDto, DeleteUserDto, LeaderboardParams, MultipleUserResponse, FindRestrictedParams, PictureDto, ChangeEmailDto } from "./user.dto.params";
import { PassportJwtAuthGuard } from "src/auth/guards/passport-jwt.guard";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService
    ) {}

    @UseGuards(PassportJwtAuthGuard)
    @Get("getall")
    findAll(@Query() params: FindAllParams): Promise<FindAllResponse> {
        return this.service.findAll(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('leaderboard')
    getLeaderboard(@Query() params: LeaderboardParams): Promise<FindAllResponse> {
        return this.service.getLeaderboard(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('getone/:id')
    findOne(@Param() params: FindOneParams): Promise<SingleUserResponse> {
        return this.service.findOne(params.id);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('add')
    addUser(@Body() userDto: CreateUserDto): Promise<SingleUserResponse> {
        return this.service.addOne(userDto);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('chname')
    changeUsername(@Body() usernameDto: ChangeUsernameDto): Promise<SingleUserResponse> {
        return this.service.changeUsername(usernameDto);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('chname')
    changeEmail(@Body() emailDto: ChangeEmailDto): Promise<SingleUserResponse> {
        return this.service.changeEmail(emailDto);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('chpass')
    changePassword(@Body() passwordDto: ChangePasswordDto): Promise<SingleUserResponse> {
        return this.service.changePassword(passwordDto);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Delete('delete')
    delete(@Body() deleteDto: DeleteUserDto) {
        return this.service.deleteOne(deleteDto);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('online')
    setOnline(@Body() input: { id: string }) {
        return this.service.setOnline(input.id);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('offline')
    setOffline(@Body() input: { id: string }) {
        return this.service.setOffline(input.id);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('list')
    findList(@Query('ids') ids: string): Promise<MultipleUserResponse> {
        const array = ids.split(',').map(Number);
        return this.service.findList(array);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('restricted')
    getRestricted(@Query() params: FindRestrictedParams) {
        return this.service.findRestricted(params);

    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async updatePicture(@UploadedFile() file: Express.Multer.File, @Body('id') id: string): Promise<{ url: string }> {
        return await this.service.updatePicture(file, id);
    }
}