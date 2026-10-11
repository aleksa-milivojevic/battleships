import { MailerCoreModule } from "@nestjs-modules/mailer/dist/mailer-core.module.js";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestMailerService } from "./mailer.service";

@Module({
    imports: [
        MailerCoreModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get('MAIL_HOST'),
                    port: config.get<number>('MAIL_PORT'),
                    secure: false,
                    auth: {
                        user: config.get('MAIL_USER'),
                        pass: config.get('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${config.get('MAIL_FROM')}>`,
                }
            }),
            inject: [ConfigService],
        })
    ],
    providers: [NestMailerService],
    exports: [NestMailerService]
})
export class NestMailerModule {}