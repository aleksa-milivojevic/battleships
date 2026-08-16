import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "./match.entity";
import { AddOneDto, FindAllParams, FindAllResponse } from "./match.dto";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>
    ) {}

    async findAll(params: FindAllParams): Promise<FindAllResponse> {
        let list = await this.matchRepository.find({
            relations: {
                winner: true,
                looser: true,
            },
            where: [
                { winner: { id: params.user } },
                { looser: { id: params.user } }
            ],
            order: {
                createdAt: 'ASC'
            }
        });

        list = list.slice((params.round-1)*params.count, params.round*params.count);

        return {
            matches: list,
            more: list.length === params.count
        }
    }

    async addOne(addDto: AddOneDto): Promise<Match> {
        const match = await this.matchRepository.create({
            winner: { id: addDto.winner },
            looser: { id: addDto.looser },
            points: addDto.points
        });

        if (!(await this.matchRepository.save(match)))
            throw new InternalServerErrorException('save failed');

        return match;
    }

    findOne(id: string): Promise<Match | null> {
        return this.matchRepository.findOneBy({ id });
    }

    async removeOne(id: string): Promise<void> {
        await this.matchRepository.delete({ id });
    }
}