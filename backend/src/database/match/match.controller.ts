import { Controller, UseGuards, Get, Query, NotImplementedException, Body, Post } from "@nestjs/common";
import { PassportJwtAuthGuard } from "src/auth/guards/passport-jwt.guard";
import { MatchService } from "./match.service";
import { AddOneDto, FindAllParams, FindAllResponse } from "./match.dto";
import { Match } from "./match.entity";

@Controller('match')
export class MatchController {
    constructor(
        private service: MatchService
    ) {}

    @UseGuards(PassportJwtAuthGuard)
    @Get("getall")
    findAll(@Query() params: FindAllParams): Promise<FindAllResponse> {
        return this.service.findAll(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('add')
    addOne(@Body() body: AddOneDto): Promise<Match> {
        return this.service.addOne(body);
    }
}