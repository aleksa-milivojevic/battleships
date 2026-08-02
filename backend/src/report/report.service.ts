import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Report } from "./report.entity";
import { Repository } from "typeorm";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>
    ) {}

    findAll(): Promise<Report[]> {
        return this.reportRepository.find();
    }

    findOne(id: number): Promise<Report | null> {
        return this.reportRepository.findOneBy({ id });
    }

    async removeOne(id: number): Promise<void> {
        await this.reportRepository.delete({ id });
    }
}