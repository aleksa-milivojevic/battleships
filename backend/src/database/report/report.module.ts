import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { Report } from "./report.entity";
import { UserModule } from "../user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([Report]), UserModule],
    providers: [ReportService],
    controllers: [ReportController],
    exports: [ReportService]
})
export class ReportModule {}