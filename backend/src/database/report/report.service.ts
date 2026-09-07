import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Report } from "./report.entity";
import { Repository } from "typeorm";
import { AddOneDto, FindAllParams, FindAllResponse } from "./report.dto";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>
    ) {}

    async findAll(params: FindAllParams): Promise<FindAllResponse> {
        let list = await this.reportRepository.find({
            relations: {
                reported: true,
                source: true,
            }
        });

        list = list.slice((params.round-1)*params.count, params.round*params.count);

        return {
            reports: list,
            more: list.length === params.count
        }
    }

    async addOne(params: AddOneDto): Promise<Report> {
        const report = await this.reportRepository.create({
            reported: { id: params.reported },
            source: { id: params.source },
            type: params.type,
            messages: params.messages
        });

        if (!(await this.reportRepository.save(report)))
            throw new InternalServerErrorException('save failed');

        return report;
    }

    async removeOnes(id: string): Promise<void> {
        const result = await this.reportRepository.delete({ reported: { id: id } });

        if (result.affected === 0) {
            throw new InternalServerErrorException('No rows affected');
        }
    }
}