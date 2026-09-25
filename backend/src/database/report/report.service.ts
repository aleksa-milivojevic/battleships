import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Report } from "./report.entity";
import { Not, Repository } from "typeorm";
import { AddOneDto, FindAllParams, FindAllResponse, ReportedUser, ReportedUsersResponse } from "./report.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
        private userService: UserService
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

    async getAll(): Promise<Report[]> {
        return this.reportRepository.find();
    }

    async reportedUsers(params: FindAllParams): Promise<ReportedUsersResponse> {
        await this.userService.checkExpiredTimeouts();

        const reports = await this.reportRepository.find({
            relations: {
                source: true,
                reported: true
            },
            where: {
                reported: {
                    id: Not(params.id)
                }
            }
        });
        if (!reports) throw new NotFoundException('no reports found');

        let map = new Map<string, ReportedUser>();
        reports.forEach(report => {
            const id = report.reported.id;

            if (!map.has(id)) {
                map.set(id, {
                    user: report.reported,
                    reports: []
                })
            }
            map.get(id)?.reports.push(report);
        });

        let list = [...map.values()].sort((a, b) => b.reports.length - a.reports.length);

        list = list.slice((params.round-1)*params.count, params.round*params.count);

        return {
            users: list,
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