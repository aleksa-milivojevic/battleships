import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { UserService } from "src/database/user/user.service";
import { MatchService } from "src/database/match/match.service";
import { UserModule } from "src/database/user/user.module";
import { MatchModule } from "src/database/match/match.module";

@Module({
    imports: [UserModule, MatchModule],
    providers: [GameGateway, GameService]
})
export class GameModule {}