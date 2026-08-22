import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/user/user.entity';
import { Match } from './database/match/match.entity';
import { Report } from './database/report/report.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './database/user/user.module';
import { MatchModule } from './database/match/match.module';
import { ReportModule } from './database/report/report.module';
import { AuthModule } from './auth/auth.module';
import { ChallangeModule } from './sockets/challange/challange.module';
import { QueueModule } from './sockets/queue/queue.module';

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
      entities: [User, Match, Report],
      synchronize: false,
    }),
    UserModule,
    MatchModule,
    ReportModule,
    AuthModule,
    ChallangeModule,
    QueueModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
