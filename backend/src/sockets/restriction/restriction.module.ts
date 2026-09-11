import { Module } from "@nestjs/common";
import { UserService } from "src/database/user/user.service";
import { RestrictionGateway } from "./restriction.gateway";
import { UserModule } from "src/database/user/user.module";
import { ReportModule } from "src/database/report/report.module";

@Module({
    imports: [UserModule, ReportModule],
    providers: [RestrictionGateway]
})
export class RestrictionModule {}