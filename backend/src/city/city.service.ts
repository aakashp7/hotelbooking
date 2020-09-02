import { Injectable } from '@nestjs/common';
import { City } from 'src/entity/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';



@Injectable()
export class CityService {
    constructor(
        @InjectRepository(City) private cityRepository: Repository<City>
    ) { }

    async getCityList(city: City) {
        try {           
            return this.cityRepository.find({
                select: ['id', 'name'],
                where: { name:city.name, status: 1}
            });
        }
        catch (error) {
            return false;
        }
    }

}
