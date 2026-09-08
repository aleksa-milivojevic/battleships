import { Module } from "@nestjs/common";
import { UserService } from "src/database/user/user.service";
import { RestrictionGateway } from "./restriction.gateway";

@Module({
    imports: [UserService],
    providers: [RestrictionGateway]
})
export class RestrictionModule {}