import { Module } from "@nestjs/common";
import { Match } from "./match.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";

@Module({
    imports: [TypeOrmModule.forFeature([Match])],
    controllers: [MatchController],
    providers: [MatchService]
})
export class MatchModule {}