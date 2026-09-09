import { Module } from "@nestjs/common";
import { UserService } from "src/database/user/user.service";
import { RestrictionGateway } from "./restriction.gateway";
import { UserModule } from "src/database/user/user.module";

@Module({
    imports: [UserModule],
    providers: [RestrictionGateway]
})
export class RestrictionModule {}