import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "./match.entity";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>
    ) {}

    findAll(): Promise<Match[]> {
        return this.matchRepository.find();
    }

    findOne(id: string): Promise<Match | null> {
        return this.matchRepository.findOneBy({ id });
    }

    async removeOne(id: string): Promise<void> {
        await this.matchRepository.delete({ id });
    }
}