import { Injectable } from '@nestjs/common';
import { Admin } from 'src/entity/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Md5 } from "md5-typescript";


@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin) private adminRepository: Repository<Admin>
    ) { }

    async login(admin: Admin) {
        try {
            admin.password = Md5.init(admin.password);
            return this.adminRepository.findOne({
                select: ['id', 'name', 'email'],
                where: { email: admin.email, password: admin.password, status: 1}
            });
        }
        catch (error) {
            return false;
        }
    }

    async updateTokenByUserId(accessToken: string, id: number) {
        try {
            let admin = await this.adminRepository.findOne(id);
            admin.accessToken = accessToken;
            await this.adminRepository.save(admin);
        }
        catch (error) {
            return false;
        }
    }
}
