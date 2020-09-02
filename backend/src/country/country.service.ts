import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In,Connection } from 'typeorm';
import { Country } from 'src/entity/country.entity';

@Injectable()
export class CountryService {
    constructor(
        private readonly connection:Connection,
        @InjectRepository(Country) private countryRepository: Repository<Country>
    ) { }


	async addNewStateProviceCode(country) {
        try {          
            return this.countryRepository.insert(country);
        }
        catch (error) {
            return false;
        }
    }

}
