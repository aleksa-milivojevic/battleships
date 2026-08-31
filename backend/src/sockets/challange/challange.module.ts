import { Module } from "@nestjs/common";
import { ChallangeGateway } from "./challange.gateway";
import { UserModule } from "src/database/user/user.module";

@Module({
    imports: [UserModule],
    providers: [ChallangeGateway]
})
export class ChallangeModule {}