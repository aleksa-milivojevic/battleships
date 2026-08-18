import { Module } from "@nestjs/common";
import { ChallangeGateway } from "./challange.gateway";

@Module({
    providers: [ChallangeGateway]
})
export class ChallangeModule {}