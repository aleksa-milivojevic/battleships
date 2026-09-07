import { Controller, Delete, Get, NotImplementedException, Post, Query, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { PassportJwtAuthGuard } from "src/auth/guards/passport-jwt.guard";
import { AddOneDto } from "./report.dto";

@Controller()
export class ReportController {
    constructor(
        private reportService: ReportService
    ) {}

    @UseGuards(PassportJwtAuthGuard)
    @Get('getall')
    getAll(@Query() params: any) {
        return this.reportService.findAll(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Post('add')
    addOne(@Query() params: AddOneDto) {
        return this.reportService.addOne(params);
    }

    @UseGuards(PassportJwtAuthGuard)
    @Delete('del')
    deleteOnes(@Query('id') id: string) {
        return this.reportService.removeOnes(id);
    }
}