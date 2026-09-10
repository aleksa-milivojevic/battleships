import { Body, Controller, Delete, Get, NotImplementedException, Post, Query, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { PassportJwtAuthGuard } from "src/auth/guards/passport-jwt.guard";
import { AddOneDto, FindAllParams } from "./report.dto";

@Controller('report')
export class ReportController {
    constructor(
        private reportService: ReportService
    ) {}

    @UseGuards(PassportJwtAuthGuard)
    @Get('getall')
    getAll() {
        return this.reportService.getAll();
    }

    @UseGuards(PassportJwtAuthGuard)
    @Get('get')
    getReportedUsers(@Query() params: FindAllParams) {
        return this.reportService.reportedUsers(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('add')
    addOne(@Body() params: AddOneDto) {
        return this.reportService.addOne(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Delete('del')
    deleteOnes(@Body('id') id: string) {
        return this.reportService.removeOnes(id);
    }
}