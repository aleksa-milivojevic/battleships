import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Match } from './match/match.entity';
import { Queue } from './queue/queue.entity';
import { Report } from './report/report.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MatchModule } from './match/match.module';
import { QueueModule } from './queue/queue.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: 'root',
      password: process.env.DB_PASSWORD,
      database: 'first_db',
      entities: [User, Match, Queue, Report],
      synchronize: false,
    }),
    UserModule,
    MatchModule,
    QueueModule,
    ReportModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
