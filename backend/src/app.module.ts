import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Venue } from './venue/venue.entity';
import { Issue } from './issue/entities/issue.entity';
import { IssueModule } from './issue/issue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [User, Venue, Issue],
        synchronize: false, // migrations only — see migrations/
        autoLoadEntities: true,
      }),
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT', 1025),
          secure: false,
        },
        defaults: { from: '"TWBBQ Issues" <issues@twbbq.local>' },
        template: {
          dir: join(__dirname, 'common', 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: false },
        },
      }),
    }),
    AuthModule,
    UsersModule,
    IssueModule,
  ],
})
export class AppModule {}
