import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Conditionally load TypeORM only if not in test environment
    ...(process.env.NODE_ENV !== 'test'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get<string>('DATABASE_HOST'),
              port: configService.get<number>('DATABASE_PORT') || 5432,
              username: configService.get<string>('DATABASE_USERNAME'),
              password: configService.get<string>('DATABASE_PASSWORD'),
              database: configService.get<string>('DATABASE_NAME'),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: configService.get('NODE_ENV') === 'development',
              logging: configService.get('NODE_ENV') === 'development',
              retryAttempts: 3,
              retryDelay: 3000,
            }),
            inject: [ConfigService],
          }),
        ]
      : []),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
