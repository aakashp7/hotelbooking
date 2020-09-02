import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync(''),
		cert: fs.readFileSync(''),
	};
 	const app = await NestFactory.create(AppModule,{httpsOptions});
 	app.enableCors();
  	await app.listen(process.env.PORT);
}
bootstrap();
