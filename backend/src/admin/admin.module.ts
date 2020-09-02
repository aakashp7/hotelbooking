import { Module } from '@nestjs/common';
import { AdminController } from 'src/admin/admin.controller';
import {  AdminService } from 'src/admin/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './../entity/admin.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
