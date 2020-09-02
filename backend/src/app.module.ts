import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, HttpModule } from '@nestjs/common';
import { Connection } from "typeorm";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { CityModule } from './city/city.module';
import { HotelModule } from './hotel/hotel.module';
import { RoomModule } from './room/room.module';
import { MulterModule } from '@nestjs/platform-express';
import { CountryModule } from './country/country.module';
import { ConfigModule } from 'nestjs-dotenv';

@Module({
        imports: [
                AdminModule,
                CityModule,
                HotelModule,
                RoomModule,
                HttpModule,
                CountryModule,
                UserModule,
                ConfigModule,
                MulterModule.register({dest: './upload'}),
                TypeOrmModule.forRoot(),
                MailerModule.forRoot({
                        transport: {
                                host: '',
                                port: ,
                                secure: false,
                                auth: {
                                        user: '',
                                        pass: ''
                                }
                        },
                        defaults: {
                                from: '"" <>',
                        },
                        template: {
                                dir: __dirname + '/email-template',
                                adapter: new HandlebarsAdapter(),
                                options: {
                                        strict: true,
                                },
                        }
                }),
        ],
        controllers: [AppController],
        providers: [AppService],
        exports: [AppService],
})

export class AppModule {
        constructor(private readonly connection: Connection) { }
}
