import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "./queue.entity";
import { Repository } from "typeorm";

@Injectable()
export class QueueService {
    constructor(
        @InjectRepository(Queue)
        private queueRepository: Repository<Queue>
    ) {}

    findAll(): Promise<Queue[]> {
        return this.queueRepository.find();
    }

    findOne(id: number): Promise<Queue | null> {
        return this.queueRepository.findOneBy({ id });
    }

    async removeOne(id: number): Promise<void> {
        await this.queueRepository.delete({ id });
    }
}