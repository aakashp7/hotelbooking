import { Controller,Query,Body,Res,Req, Get,Post,HttpStatus } from '@nestjs/common';
import {  City } from 'src/entity/city.entity';
import { CityService } from 'src/city/city.service';


@Controller('api/')
export class CityController {

    constructor(
        private cityService: CityService,
    ) {}

    // @Get('citylist')
    // list(@Query() city:City,@Res() res) {
    //     try {
    //         if (!city.name) {
    //             res.status(HttpStatus.OK).json({ success: false, message: "Please enter name" });
    //             return false;
    //         }
    //         this.cityService.getCityList(city).then((response) => {
    //             if(response){
    //                 let city = [];
    //                 response.map(element => {
    //                  //   console.log(element);
    //                     city.push({
    //                         "cityid":element.id,
    //                         "name":element.name,
    //                         "hotelCount":0
    //                     });
    //                 });
    //                 let data = {"Cities":city};                    
    //                 res.status(HttpStatus.OK).json(data);                
    //             } else{
    //                 let data = {"Cities":[]};
    //                 res.status(HttpStatus.OK).json(data);                
    //             }                
    //         });
    //     } catch (error) {
    //         res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    //     }
    // }
}
