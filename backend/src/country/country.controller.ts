import { createParamDecorator,Controller, Post, Body, Res,Req, Get, HttpStatus,Header, Query,ExecutionContext, BadRequestException, UseGuards,Request, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserLike } from 'src/entity/user-like.entity';
import { UserComment } from 'src/entity/user-comment.entity';
import * as fs from 'fs';
import * as csvToJson from 'convert-csv-to-json';
import { CountryService } from 'src/country/country.service';

@Controller('api/')
export class CountryController {
	constructor(private countryService: CountryService) {
	}

	@Post('addNewStateProviceCode')
	@UseInterceptors(FileInterceptor('files', {
		storage: diskStorage({
			destination: './upload',
			filename: (req, file, cb) => {
				const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
				return cb(null, `${randomName}${extname(file.originalname)}`)
			}
		})
	}))

	addNewStateProviceCode(@UploadedFile() files,@Body('fileType') fileType: String, @Res() res): boolean {
		try {
			if (!files) {
				res.status(HttpStatus.OK).json({ success: false, message: "Please select file" });
				return false;
			}
			const countryData = csvToJson.fieldDelimiter('|') .getJsonFromCsv(files.path.toString());
			countryData.forEach(element=>{
				let country = {
					"countryId": element.ID_COUNTRY,
					"countryName": element.NAME_COUNTRY,
					"provinceId":element.ID_PROVINCE,
					"provinceName":element.NAME_PROVINCE,
					"townId": element.ID_TOWN,
					"townName": element.NAME_TOWN
				};
				this.countryService.addNewStateProviceCode(country).then(response=>{});
			});	
			res.status(HttpStatus.OK).json({ success: true, message: "Successfully add state province code" });						
		}
		catch (error) {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
		}
	}		
}
