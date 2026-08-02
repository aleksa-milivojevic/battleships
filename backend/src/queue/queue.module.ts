import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Queue } from "./queue.entity";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Queue])],
    providers: [QueueService],
    controllers: [QueueController]
})
export class QueueModule {}