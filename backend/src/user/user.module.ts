import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { UserRequest } from 'src/entity/user-request.entity';
import { Message } from 'src/entity/message.entity';
import { CustomerSupport } from 'src/entity/customer-support.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRequest,User,Message,CustomerSupport]),
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
