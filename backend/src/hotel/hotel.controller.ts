import { Controller, Post, Body, Res,Req, Get, HttpStatus,UseGuards,Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { FileInterceptor } from '@nestjs/platform-express';
import { HotelService } from 'src/hotel/hotel.service';
import { Hotel } from 'src/entity/hotel.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { JWTAuthGuard } from 'src/auth/jwtauth.guard';
import { UserLike } from 'src/entity/user-like.entity';
import { UserComment } from 'src/entity/user-comment.entity';
import * as csvToJson from 'convert-csv-to-json';
import * as xmlToJson from 'xml-to-json-stream';
import * as randtoken from 'rand-token';
import * as fs from 'fs';

@Controller('api/')
export class HotelController {
	constructor(
		private hotelService: HotelService,
		private mailerService:MailerService
	) {}
	

	// Use for generate random token
	generateRandomToken():string{
        return randtoken.generate(30);   
	}
		
	// store new hotel
	@Post('addNewHotel')
	@UseInterceptors(FileInterceptor('files', {
		storage: diskStorage({
			destination: "./upload",
			filename: (req, file, cb) => {
				const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
				return cb(null, `${randomName}${extname(file.originalname)}`)
			}
		})
	}))	
	addNewHotel(@UploadedFile() files,@Body('fileType') fileType: String, @Res() res): boolean {
		try {
			if (!files) {
				res.status(HttpStatus.OK).json({ success: false, message: "Please select file" });
				return false;
			}
			if(fileType=="txt") {
				let jsondata = fs.readFileSync(files.path.toString(), { encoding: 'utf-8' });
				const parser = xmlToJson({ attributeMode: true });
				parser.xmlToJson(jsondata, (err, json) => {
					if (err) {
						console.log(err);
					}
					if (json.hasOwnProperty('HotelDescriptiveInfo')) {
						if(Array.isArray(json.HotelDescriptiveInfo)){
							json.HotelDescriptiveInfo.forEach(element => {
								let data = element.HotelDescriptiveContents.HotelDescriptiveContent.TPA_Extensions;
								let hotelDetails = {
									"hotelCode":"",
									"country": data.Address.CountryName.Name,
									"state": data.Address.StateName.Name,
									"city": data.Address.CityName.Name,
									"postalcode": data.Address.PostalCode.Code,
									"address": data.Address.locationaddress.Description,
									"longitude": data.Address.longitude.Code,
									"latitude": data.Address.latitude.Code,
									"attribute": JSON.stringify(data.Attributes.Attribute),
									"image": JSON.stringify(data.Photos.Photo),
									"tokenName": data.ProviderTokens.Token.TokenName,
									"tokenCode": data.ProviderTokens.Token.TokenCode,
									"categoryCode": data.HotelInfo.CategoryCode.Code,
									"categoryUngroupedCode": data.HotelInfo.CategoryUngroupedCode.Code,
									"categoryName": data.HotelInfo.CategoryName.Name,
									"type": data.HotelInfo.Type.Type,
									"phone": (data.Communication.Phones.Phone[0]) ? (data.Communication.Phones.Phone[0].PhoneNumber) : "",
									"fax": (data.Communication.Fax.hasOwnProperty('PhoneNumber')) ? (data.Communication.Fax.PhoneNumber) : '',
									"email": data.Communication.Email.mail,
									"url": data.Communication.URL.URL,
									"hotelName": data.HotelInfo.Name.Name
								};
								this.hotelService.addNewHotel(hotelDetails).then();
							});
							res.status(HttpStatus.OK).json({ success: true, message: "Successfully add hotel" });
						}
						else
						{
							let data = json.HotelDescriptiveInfo.HotelDescriptiveContents.HotelDescriptiveContent.TPA_Extensions;
							let hotelDetails = {
								"hotelCode":"",
								"country": data.Address.CountryName.Name,
								"state": data.Address.StateName.Name,
								"city": data.Address.CityName.Name,
								"postalcode": data.Address.PostalCode.Code,
								"address": data.Address.locationaddress.Description,
								"longitude": data.Address.longitude.Code,
								"latitude": data.Address.latitude.Code,
								"attribute": JSON.stringify(data.Attributes.Attribute),
								"image": JSON.stringify(data.Photos.Photo),
								"tokenName": data.ProviderTokens.Token.TokenName,
								"tokenCode": data.ProviderTokens.Token.TokenCode,
								"categoryCode": data.HotelInfo.CategoryCode.Code,
								"categoryUngroupedCode": data.HotelInfo.CategoryUngroupedCode.Code,
								"categoryName": data.HotelInfo.CategoryName.Name,
								"type": data.HotelInfo.Type.Type,
								"phone": JSON.stringify(data.Communication.Phones.Phone),
								"fax": JSON.stringify(data.Communication.Fax),
								"email": data.Communication.Email.mail,
								"url": data.Communication.URL.URL,
								"hotelName": data.HotelInfo.Name.Name
							};
							this.hotelService.addNewHotel(hotelDetails).then();
						}
						res.status(HttpStatus.OK).json({ success: true, message: "Successfully add hotel" });
					}
					else {
						res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
					}
				});
			}
			else{
				const hotelData = csvToJson.fieldDelimiter('|') .getJsonFromCsv(files.path.toString());
				hotelData.forEach(element=>{
					let hotelDetails = {
						"hotelCode": element.ID_HOTEL,
						"categoryCode": element.ID_CATEGORY,
						"type":element.TYPE_HOTEL,
						"cadhot":element.ID_CADHOT,
						"hotelName": element.NOMBRE_HOTEL,
						"countryId": element.ID_COUNTRY,
						"provinceId": element.ID_PROVINCE,
						"townId": element.ID_TOWN,
						"city": element.NAME_TOWN,
						"address": element.NAME_STREET,
						"postalcode": element.ZIP,
						"longitude": element.LONGITUDE,
						"latitude":  element.LATITUDE,
						"phone": element.PHONE,
						"fax": element.FAX
					};
					this.hotelService.addNewHotel(hotelDetails).then();
				});	
				res.status(HttpStatus.OK).json({ success: true, message: "Successfully add hotel" });			
			}
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
		}
	}

	// get hotel list
	@Get('getHotelList')
	getHotelList(@Body() request: Hotel, @Res() res): void {
		try {
			this.hotelService.getHotelList().then((response) => {
				if (response) {
					res.status(HttpStatus.OK).json({ success: true, message: "Successfully get hotel list", data: response });
				}
				else {
					res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
				}
			});
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	}

	// Start mobile side api

	@Post('userLike')
	@UseGuards(JWTAuthGuard)
	userLike(@Body() request: UserLike, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!request.hotelCode) {
                res.status(HttpStatus.OK).json({message: "Please enter hotel code" });
                return false;
            }
            this.hotelService.userLike(userLoginid,request.hotelCode,request.isLike).then((response) => {
				if(request.isLike==1){
					res.status(HttpStatus.OK).json({message: "Successfully add like"});
				}
				else {
					res.status(HttpStatus.OK).json({message: "Successfully add dislike"});
				}
			});
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	}
	
	@Post('userComment')
	@UseGuards(JWTAuthGuard)
	userComment(@Body() request: UserComment, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!request.hotelCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter hotel code" });
                return false;
            }
            if (!request.comment) {
                res.status(HttpStatus.OK).json({ message: "Please enter comment" });
                return false;
            }
			this.hotelService.userComment(userLoginid,request.hotelCode,request.comment).then((response) => {
				if (response) {
					res.status(HttpStatus.OK).json({  message: "Successfully add comment"});
				}
				else {
					res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
				}
			});
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	}

	
	@Post('searchHotel')
	async searchHotel(@Req() request,@Body() body, @Res() res) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({ message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({ message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({ message: "Please enter town name" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let index = 0;
			let hotelResult = await this.hotelService.searchHotel(parameter).then((response)=>{
				return response.status==200 ? response.data : false; 
			});			
			if(hotelResult){
				const parser = xmlToJson({ attributeMode:true });
				let result = await parser.xmlToJson(hotelResult,async(error, json) => {
					if(error) {
						console.log("JSON Error",error);
						return false;
					}
					let hotelList = [];
					json.HotelDetails.Hotel.forEach(async (element) => {
						index++;
						let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(element.HotelCode);		
						let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(element.HotelCode);		
						let price = Array.isArray(element.Rooms.Room) ? element.Rooms.Room[0].AmountAfterTax : element.Rooms.Room.AmountAfterTax;
						if(body.minPrice!==undefined && body.maxPrice!==undefined){
							if(body.isAbovePrice!==undefined && body.isAbovePrice==1){
								if(!(Number(price) > Number(body.minPrice))) {
									return;
								}									
							}
							else {
								if(!(Number(price) > Number(body.minPrice) && Number(price) < Number(body.maxPrice))){
									return;
								}
							}
						}
						hotelList.push({
							"service":element.Service,
							"starRating":element.StarRating,
							"hotelCode":element.HotelCode,
							"hotelName":element.HotelName,
							"hotelType":element.HotelType,
							"provider":element.Provider,
							"location":element.Location,
							"facilities":element.Facilities,
							"limitationPolicies":element.LimitationPolicies,
							"recreation":element.Recreation,
							"imageUrls":element.ImageUrls,
							'policies':element.Policies,
							"price":price,
							"hotelImage":element.HotelImages,
							"hotelLike":totalLike,
							"hotelComment":totalComment,
						});
					});
					if(body.sortBy!==undefined){
						if(body.sortBy==2){
							hotelList.sort(function(a, b) { return Number(b.price) - Number(a.price)});
						}	
					}
					return hotelList;
				}); 
				if(result && result.length>0) {
					res.status(HttpStatus.OK).json({message: "Successfully get hotel list",hotelList:result});	
					return false;
				}
				else {
					res.status(HttpStatus.OK).json({message: "Hotel not found..." });	
					return false;
				}
			}
			else {
				res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
            	return false;
			}	
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	}

	/*@Post('searchHotel')
	async searchHotel(@Req() request,@Body() body, @Res() res) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({ message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({ message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({ message: "Please enter town name" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let index = 0;
			this.hotelService.searchHotel(parameter).then((response)=>{
				if(response.status==200){
					const parser = xmlToJson({ attributeMode:true });
					parser.xmlToJson(response.data, (error, json) => {
						if(error) {
							console.log("JSON Error",error);
							res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
							return false;
						}
						let hotelList = [];
						json.HotelDetails.Hotel.forEach(async (element) => {
							index++;
							let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(element.HotelCode);		
							let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(element.HotelCode);		
							let price = Array.isArray(element.Rooms.Room) ? element.Rooms.Room[0].AmountAfterTax : element.Rooms.Room.AmountAfterTax;
							if(body.minPrice!==undefined && body.maxPrice!==undefined){
								if(body.isAbovePrice!==undefined && body.isAbovePrice==1){
									if(!(Number(price) > Number(body.minPrice))) {
										return;
									}									
								}
								else {
									if(!(Number(price) > Number(body.minPrice) && Number(price) < Number(body.maxPrice))){
										return;
									}
								}
							}
							hotelList.push({
								"service":element.Service,
								"starRating":element.StarRating,
								"hotelCode":element.HotelCode,
								"hotelName":element.HotelName,
								"hotelType":element.HotelType,
								"provider":element.Provider,
								"location":element.Location,
								"facilities":element.Facilities,
								"limitationPolicies":element.LimitationPolicies,
								"recreation":element.Recreation,
								"imageUrls":element.ImageUrls,
								'policies':element.Policies,
								"price":price,
								"hotelImage":element.HotelImages,
								"hotelLike":totalLike,
								"hotelComment":totalComment,
							});
						});
						if(body.sortBy!==undefined){
							if(body.sortBy==2){
								hotelList.sort(function(a, b) { return Number(b.price) - Number(a.price)});
							}	
						}
						setTimeout(()=>{
							res.status(HttpStatus.OK).json({message: "Successfully get hotel list",hotelList:hotelList});
						},100);
					});
				}	
				else {
					res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
				}
			});			
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	} */


	@Post('getHotelDetailById')
	async getHotelDetailById(@Req() request,@Body() body, @Res() res) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({ message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({ message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({ message: "Please enter town name" });
                return false;
            }   
            if (!body.hotelCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter hotel code" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let index = 0;
			this.hotelService.searchHotel(parameter).then((response)=>{
				if(response.status==200){
					const parser = xmlToJson({ attributeMode:true });
					parser.xmlToJson(response.data,  async (error, json) => {
						if(error) {
							res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
							return false;
						}
						const hotelDetails = json.HotelDetails.Hotel.find(element=>(element.HotelCode===body.hotelCode));
						if(hotelDetails) {
							let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(hotelDetails.HotelCode);		
							let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(hotelDetails.HotelCode);		
							let commentList = await this.hotelService.getCommentListByHotelCode(hotelDetails.HotelCode);	
							commentList.forEach((element,index)=>{
								commentList[index]["photo"] =  (commentList[index]["photo"] !=="" && commentList[index]["photo"] !==null)  ? (process.env.IMAGE_UPLOAD_PATH + commentList[index]["photo"])  : process.env.USER_DEFAULT_IMAGE_PATH;
							});
							let price = Array.isArray(hotelDetails.Rooms.Room) ? hotelDetails.Rooms.Room[0].AmountAfterTax : hotelDetails.Rooms.Room.AmountAfterTax;
							let data = {
								"service":hotelDetails.Service,
								"starRating":hotelDetails.StarRating,
								"hotelCode":hotelDetails.HotelCode,
								"hotelName":hotelDetails.HotelName,
								"hotelType":hotelDetails.HotelType,
								"provider":hotelDetails.Provider,
								"location":hotelDetails.Location,
								"facilities":hotelDetails.Facilities,
								"limitationPolicies":hotelDetails.LimitationPolicies,
								"recreation":hotelDetails.Recreation,
								"imageUrls":hotelDetails.ImageUrls,
								'policies':hotelDetails.Policies,
								"price":price,
								"hotelImage":hotelDetails.HotelImages,
								"hotelLike":totalLike,
								"hotelComment":totalComment,
								"commentList":commentList
							}
							res.status(HttpStatus.OK).json({message: "Successfully get hotel details",hotelDetail:data});
						}	
						else {
							res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
						}
					});
				}	
				else {
					res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
				}
			});			
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('booking')
	@UseGuards(JWTAuthGuard)
	async booking(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!body.paymentType) {
                res.status(HttpStatus.OK).json({ message: "Please enter payment type" });
                return false;
			}
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter check out date" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({ message: "Please enter town name" });
                return false;
            }
            if (!body.hotelSLNo) {
                res.status(HttpStatus.OK).json({ message: "Please enter hotel sl no" });
                return false;
            }
            if (!body.service) {
                res.status(HttpStatus.OK).json({ message: "Please enter service" });
                return false;
            }   
            if (!body.starRating) {
                res.status(HttpStatus.OK).json({ message: "Please enter star rating" });
                return false;
            }            
            if (!body.hotelCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter hotel code" });
                return false;
            }            
            if (!body.hotelName) {
                res.status(HttpStatus.OK).json({ message: "Please enter hotel name" });
                return false;
            }            
            if (!body.totalRoomsCount) {
                res.status(HttpStatus.OK).json({ message: "Please enter total room count" });
                return false;
            }            
            if (!body.roomNo) {
                res.status(HttpStatus.OK).json({ message: "Please enter room no" });
                return false;
            }            
            if (!body.roomTypeCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter room type code" });
                return false;
            }            
            if (!body.ratePlanCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter room plan code" });
                return false;
            }            
            if (!body.invBlockCode) {
                res.status(HttpStatus.OK).json({ message: "Please enter inv block code" });
                return false;
            }            
            if (!body.roomDescription) {
                res.status(HttpStatus.OK).json({ message: "Please enter room description" });
                return false;
            }            
            if (!body.availabilityStatus) {
                res.status(HttpStatus.OK).json({ message: "Please enter availability status" });
                return false;
            }            
            if (!body.amountAfterTax) {
                res.status(HttpStatus.OK).json({ message: "Please enter amount after tax" });
                return false;
            }            
            if (!body.nonRefundable) {
                res.status(HttpStatus.OK).json({ message: "Please enter non refundable" });
                return false;
            }            
            if (!body.totalRateIncTax) {
                res.status(HttpStatus.OK).json({ message: "Please enter total rate inc tax" });
                return false;
            }            
            if (!body.roomToken) {
                res.status(HttpStatus.OK).json({ message: "Please enter room token" });
                return false;
            }            
            if (!body.noOfNights) {
                res.status(HttpStatus.OK).json({ message: "Please enter no of night" });
                return false;
            }            
            if (!body.nonRefundable) {
                res.status(HttpStatus.OK).json({ message: "Please enter non refundable" });
                return false;
            }            
            if (!body.cancellationStartDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter cancellation start date" });
                return false;
            }            
            if (!body.cancellationEndDate) {
                res.status(HttpStatus.OK).json({ message: "Please enter cancellation end date" });
                return false;
            }            
            if (!body.cancellationAmount) {
                res.status(HttpStatus.OK).json({ message: "Please enter cancellation amount" });
                return false;
            }            
            if (!body.firstName) {
                res.status(HttpStatus.OK).json({ message: "Please enter first name" });
                return false;
            }            
            if (!body.lastName) {
                res.status(HttpStatus.OK).json({ message: "Please enter last name" });
                return false;
            }            
            if (!body.gender) {
                res.status(HttpStatus.OK).json({ message: "Please enter gender " });
                return false;
            }            
            if (!body.passengerType) {
                res.status(HttpStatus.OK).json({ message: "Please enter passenger type " });
                return false;
            }            
            if (!body.age) {
                res.status(HttpStatus.OK).json({ message: "Please enter age" });
                return false;
			}         			
			if(body.paymentType==1) {
				if(!body.cardNumber){
					res.status(HttpStatus.OK).json({message:"Please enter card number"});
					return false;
				}
				if(!body.expiryDate){
					res.status(HttpStatus.OK).json({message:"Please enter expiry date"});
					return false;
				}
				if(!body.securityCode){
					res.status(HttpStatus.OK).json({message:"Please enter security code"});
					return false;
				}				
			}
			else {
				if(!body.transctionId){
					res.status(HttpStatus.OK).json({message:"Please enter transction id"});
					return false;
				}
			}
			const userResult = await this.hotelService.getUserDetails(userLoginid);
			if(userResult) {
				const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
				if(provinceId==""){
					res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
					return false;
				}
				const parameter = this.createHotelPreBookingXmlFormat(body,provinceId);			
				const hotelPreBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
					return (response.status==200) ? response.data : false;  
				});	
				if(hotelPreBookingResult) {
					const parser = xmlToJson({ attributeMode:true });
					const result = await parser.xmlToJson(hotelPreBookingResult, (error, json) => {
						if(error) {
							res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
							return false;
						}
						if(json.hasOwnProperty('OTA_HotelResRS')){
							return false;
						}
						if(json.hasOwnProperty('HotelPreBookingResponse')){
							return json.HotelPreBookingResponse.HotelReservation;
						}
					});
					if(result) {
						const name = userResult.name.split(" ");
						const firstName = (name[0] && name[0]!="") ? name[0] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user';
						const lastName = (name[1] && name[1]!="") ? name[1] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user';
						const data = {
							hotelSLNo:body.hotelSLNo,
							service:result.Service,
							starRating:body.starRating,
							hotelCode:result.HotelDetails.HotelCode,
							hotelName:result.HotelDetails.HotelName,
							preBookingRequestId:result.ReservationId,
							roomNo:body.roomNo,
							age:body.age,
							count:body.count,
							firstName:firstName,
							lastName:lastName,
							gender:body.gender,
							passengerType:body.passengerType,
							countryCode:body.countryCode,
						};
						const parameter = this.createConfirmBookingRequest(data);
						const hotelConfirmBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
							return (response.status==200) ? response.data : false;  
						});	
						if(hotelConfirmBookingResult){
							const parser = xmlToJson({ attributeMode:true });
							const result = await parser.xmlToJson(hotelConfirmBookingResult, (error, json) => {
								if(error) {
									console.log("Json Errors : ",error);
									res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
									return false;
								}
								if(json.hasOwnProperty("HotelBookingResponse")) {
									return json.HotelBookingResponse;
								}
								else {
									return false;
								}
							});	
							if(result) {
								const paymentData = {
									userId:userResult.id,
									hotelCode:body.hotelCode,
									cardHolderName:"Test",
									cardNumber:body.cardNumber,
									expiryDate:body.expiryDate,
									securityCode:body.securityCode,
									amount:(Number(body.amount) * 100),
									firstName:firstName,
									lastName:lastName,
									description:"Hotel Booking Payment",
									vendorTxCode:this.generateRandomToken()			
								}
								let transctionId = "";
								if(body.paymentType==1){
									const paymentResult = await this.hotelService.getMerchantSessionKey(paymentData);
									if(paymentResult){
										if(paymentResult.hasOwnProperty("status")){
											if(paymentResult.status=='Ok') {
												return paymentResult.transactionId		
											}	
											else {
												const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
												const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
													return (response.status==200) ? response.data : false;  
												});
												if(cancelBookingResult){
													const parser = xmlToJson({ attributeMode:true });
													const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
														if(error) {
															res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
															return false;
														}
														if(json.hasOwnProperty("HotelCancelBooking")) {
															if(json.HotelCancelBooking.Status=='Cancelled') {
																res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
																return false;
															}
														}
														res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
														return false;
													});
												}
												else {
													res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
													return false;
												}				
											}
										}
										else {
											const error = Array.isArray(paymentResult) ? ((paymentResult[0].description !=undefined && paymentResult[0].description!=null) ? paymentResult[0].description : "Something went wrong,Please try again later...")  : ((paymentResult.description !=undefined && paymentResult.description!=null) ? paymentResult.description : "Something went wrong,Please try again later...");	
											const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
											const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
												return (response.status==200) ? response.data : false;  
											});
											if(cancelBookingResult){
												const parser = xmlToJson({ attributeMode:true });
												const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
													if(error) {
														res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
														return false;
													}
													if(json.hasOwnProperty("HotelCancelBooking")) {
														if(json.HotelCancelBooking.Status=='Cancelled') {
															res.status(HttpStatus.OK).json({message:error});									
															return false;
														}
													}
													res.status(HttpStatus.OK).json({ message:error});									
													return false;
												});
											}
											else {
												res.status(HttpStatus.OK).json({ message:error});									
												return false;
											}												 
										}
									}
									else{
										const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
										const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
											return (response.status==200) ? response.data : false;  
										});
										if(cancelBookingResult){
											const parser = xmlToJson({ attributeMode:true });
											const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
												if(error) {
													res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
													return false;
												}
												if(json.hasOwnProperty("HotelCancelBooking")) {
													if(json.HotelCancelBooking.Status=='Cancelled') {
														res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
														return false;
													}
												}
												res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
												return false;
											});
										}
										else {
											res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
											return false;
										}
									}
								}
								else {
									transctionId = body.transctionId;
								}
								const params = {
									transactionId:transctionId,	
									userId:userResult.id,	
									phone:body.phone,	
									hotelCode:body.hotelCode,	
									hotelName:body.hotelName,	
									checkInDate:body.checkInDate,	
									checkOutDate:body.checkOutDate,	
									hotelImage:body.hotelImage,	
									address:body.location,	
									adults:body.adults ? body.adults : 0,	
									rooms:body.rooms ? body.rooms : 0,
									children:body.children ? body.children : 0,
									amount:body.amount,
									paymentType:body.paymentType,
									reservationId:result.HotelReservation.ReservationId
								}
								this.hotelService.transaction(params).then(response=>{
									if(response) {
										res.status(HttpStatus.OK).json({message: "Successfully booking",bookingId:response.raw.insertId});						
									}
									else {
										res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });			
									}
								});	
							}
							else {
								console.log("Confirm booking response json convert issuse");
								res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
							}
						}
						else {
							console.log("Confirm booking isssue");
							res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
						}			
					}
					else {
						console.log(" Pre booking response json convert issuse");
						res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
					}
				}
				else {
					console.log("Pre booking isssue");
					res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..." });
				}	
			} 
			else {
				console.log("User not found");
            	res.status(HttpStatus.OK).json({  message: "Something went wrong,Please try again later..." });
			}
		}
		catch(error) {
			console.log("Internal server error",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({  message: "Something went wrong,Please try again later..." });
		}	
	}

	@Post('getcomment')
	async getComment(@Body("hotelCode") hotelCode:string,@Body("userId") userId:number, @Res() res) {
		try {
			if (!hotelCode) {
                res.status(HttpStatus.OK).json({message: "Please enter hotel code" });
                return false;
			}
			let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(hotelCode);		
			let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(hotelCode);		
			let isUserLike = await this.hotelService.checkUserLike(hotelCode,userId);		
			let commentList = await this.hotelService.getCommentByHotelCode(hotelCode,userId);				
			commentList.forEach((element,index)=>{
				commentList[index]["hotelDisLike"] = Number(commentList[index]["hotelDisLike"]);
				commentList[index]["hotelLike"] = Number(commentList[index]["hotelLike"]);
				commentList[index]["isDisLike"] = Number(commentList[index]["isDisLike"]);
				commentList[index]["isLike"] = Number(commentList[index]["isLike"]);
				commentList[index]["photo"] =  (commentList[index]["photo"] !=="" && commentList[index]["photo"] !==null)  ? (process.env.IMAGE_UPLOAD_PATH + commentList[index]["photo"])  : process.env.USER_DEFAULT_IMAGE_PATH;
			});
			let result = { 
				isLike:isUserLike ? Number(isUserLike.isLike) : 0,
				commentList: commentList,
				like: Number(totalLike),
    			comment: Number(totalComment)
			};	
			res.status(HttpStatus.OK).json({response:result});	
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('commentLike')
	@UseGuards(JWTAuthGuard)
	async commentLike(@Body("commentId") commentId:number,@Param("userLoginid") userLoginid:number,@Body("isLike") isLike:number,@Res() res) {
		try {
			if (!commentId) {
                res.status(HttpStatus.OK).json({message: "Please enter comment id" });
                return false;
			}	
			const  result = await this.hotelService.commentLikeById(commentId,isLike,userLoginid);
			if(result) {
				if(isLike==1) {
					res.status(HttpStatus.OK).json({message: "Successfully add comment like"});	
				}
				else {
					res.status(HttpStatus.OK).json({message: "Successfully add comment dislike"});	
				}
			}
			else {
				res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..."});	
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..."});
		}
	}

	@Get('mybooking')
	@UseGuards(JWTAuthGuard)	
	async myBooking(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!userLoginid) {
                res.status(HttpStatus.OK).json({message: "Please enter user id" });
                return false;
			}
			let currentBooking = await this.hotelService.getCurrentBooking(userLoginid);
			let pastBooking = await this.hotelService.getPastBooking(userLoginid);
			let current = [];
			let past = [];
			currentBooking.forEach((element) => {
				current.push(this.getMybookingResponse(element));							
			});
			pastBooking.forEach((element) => {
				past.push(this.getMybookingResponse(element));				
			});
			res.status(HttpStatus.OK).json({currentBooking:current,pastBooking:past});										
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..." });
		}
	}


	@Post('getBookingDetailByHotelCode')
	@UseGuards(JWTAuthGuard)
	async getBookingDetailByHotelCode(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({message: "Please enter town name" });
                return false;
            }   
            if (!body.hotelCode) {
                res.status(HttpStatus.OK).json({message: "Please enter hotel code" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({message: "Hotel not found..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let hotelResult = await this.hotelService.searchHotel(parameter).then((response)=>{
				return response.status==200 ? response.data : false; 
			});			
			if(hotelResult) {
				const parser = xmlToJson({ attributeMode:true });
				let result = await parser.xmlToJson(hotelResult,async(error, json) => {
					if(error) {
						console.log("JSON Error",error);
						return false;
					}					
					const userId = userLoginid;
					if (json.hasOwnProperty('HotelDetails')) {
						if(Array.isArray(json.HotelDetails.Hotel)){						
							const hotelDetails = json.HotelDetails.Hotel.find(element=>(element.HotelCode==body.hotelCode));
							if(hotelDetails) {
								return this.bookingDetailResponse(body,hotelDetails,provinceId);
							}
							return false;
						}
						else {
							if(json.HotelDetails.Hotel.HotelCode==body.hotelCode){
								return this.bookingDetailResponse(body,json.HotelDetails.Hotel,provinceId);
							}
							return false;
						}	
					}
					else {
						return false;
					}
				});
				if(result) {
					res.status(HttpStatus.OK).json({message: "Successfully booking details",data:result});	
					return false;
				}
				else {
					res.status(HttpStatus.OK).json({message: "Booking details not found..." });	
					return false;
				}
			}
			else {
				res.status(HttpStatus.OK).json({message: "Booking details not found..." });
            	return false;
			}				
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('getHotelBookingById')
	@UseGuards(JWTAuthGuard)
	async getHotelBookingById(@Body("bookingId") bookingId:number,@Res() res) {
		try {
			if (!bookingId) {
                res.status(HttpStatus.OK).json({message: "Please enter booking id" });
                return false;
			}	
			const  result = await this.hotelService.getBookingById(bookingId);
			if(result){
				if(result.length > 0){
					res.status(HttpStatus.OK).json({message: "Successfully get booking details...",data:result[0]});
				}
				else{
					res.status(HttpStatus.OK).json({message: "Hotel booking not found..."});
				}
			}
			else {
				res.status(HttpStatus.OK).json({message: "Hotel booking not found..."});
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..."});
		}
	}

	@Get('notification')
	@UseGuards(JWTAuthGuard)
	async notification(@Param("userLoginid") userLoginid:number,@Res() res) {
		try {
			const  result = await this.hotelService.getNotification(userLoginid);
			if(result) {
				let data = [];
				result.forEach(element => {
					data.push({
						date:element.date,
						message:element.time + "before your checkout !"
					});
				});	
				res.status(HttpStatus.OK).json({message: "Successfully get notification list",data:data});	
			}
			else {
				res.status(HttpStatus.OK).json({message: "Something went wrong,Please try again later..."});	
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..."});
		}
	}	
	// End mobile side api

	// Start  web api
	async createSearchHotelResponse(element,body,userId){		
		let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(element.HotelCode);		
		let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(element.HotelCode);		
		let isUserLike = await this.hotelService.checkUserLike(element.HotelCode,userId);		
		let price = Array.isArray(element.Rooms.Room) ? element.Rooms.Room[0].AmountAfterTax : element.Rooms.Room.AmountAfterTax;
		if(body.minPrice !== undefined && body.minPrice !== ""  && body.maxPrice !== undefined && body.maxPrice !== "") {
			if(body.isAbovePrice !== undefined && body.isAbovePrice !== "" && body.isAbovePrice === 1) {
				if(!(Number(price) > Number(body.minPrice))) {
					return false;
				}									
			}
			else {
				if(!(Number(price) > Number(body.minPrice) && Number(price) < Number(body.maxPrice))){
					return false;
				}
			}
		}
		let data = {
			"service":element.Service,
			"starRating":element.StarRating,
			"hotelCode":element.HotelCode,
			"hotelName":element.HotelName,
			"hotelType":element.HotelType,
			"provider":element.Provider,
			"location":element.Location,
			"facilities":element.Facilities,
			"limitationPolicies":element.LimitationPolicies,
			"recreation":element.Recreation,
			"imageUrls":element.ImageUrls,
			'policies':element.Policies,
			"price":price,
			"hotelImage":element.HotelImages,
			"hotelLike":Number(totalLike),
			"hotelComment":Number(totalComment),
			"isLike":isUserLike ? Number(isUserLike.isLike) : 0
		};
		return data;
	}
	async createSearchHotelDetailResponse(hotelDetails,userId){	
		let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(hotelDetails.HotelCode);		
		let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(hotelDetails.HotelCode);		
		let isUserLike = await this.hotelService.checkUserLike(hotelDetails.HotelCode,userId);		
		let commentList = await this.hotelService.getCommentByHotelCode(hotelDetails.HotelCode,userId);	
		commentList.forEach((element,index)=>{
			commentList[index]["photo"] =  (commentList[index]["photo"] !=="" && commentList[index]["photo"] !==null)  ? (process.env.IMAGE_UPLOAD_PATH + commentList[index]["photo"])  : process.env.USER_DEFAULT_IMAGE_PATH;
			commentList[index]["hotelDisLike"] = Number(commentList[index]["hotelDisLike"]);
			commentList[index]["hotelLike"] = Number(commentList[index]["hotelLike"]);
			commentList[index]["isDisLike"] = Number(commentList[index]["isDisLike"]);
			commentList[index]["isLike"] = Number(commentList[index]["isLike"]);
		});
		let price = Array.isArray(hotelDetails.Rooms.Room) ? hotelDetails.Rooms.Room[0].AmountAfterTax : hotelDetails.Rooms.Room.AmountAfterTax;
		let data = {
			"service":hotelDetails.Service,
			"starRating":hotelDetails.StarRating,
			"hotelCode":hotelDetails.HotelCode,
			"hotelName":hotelDetails.HotelName,
			"hotelType":hotelDetails.HotelType,
			"provider":hotelDetails.Provider,
			"location":hotelDetails.Location,
			"facilities":hotelDetails.Facilities,
			"limitationPolicies":hotelDetails.LimitationPolicies,
			"recreation":hotelDetails.Recreation,
			"imageUrls":hotelDetails.ImageUrls,
			'policies':hotelDetails.Policies,
			"price":price,
			"hotelImage":hotelDetails.HotelImages,
			"hotelLike":Number(totalLike),
			"hotelComment":Number(totalComment),
			"commentList":commentList,
			"isLike":isUserLike ? Number(isUserLike.isLike) : 0,
			"tax":process.env.HOTEL_TAX
		}
		return data;
	}
	bookingDetailResponse(body,hotelDetails,provinceId){
		let data = {
			"address":body.address,
			"startDate":body.checkInDate,
			"endDate":body.checkOutDate,
			"checkInDate":hotelDetails['Check-In'],
			"checkOutDate":hotelDetails['Check-Out'],
			"rooms":body.rooms,
			"children": Array.isArray(body.childern) ? body.childern.length : 0,
			"adults":body.adults,
			"hotelName" : hotelDetails.HotelName,
			"location":hotelDetails.Location,
			"hotelCode" : hotelDetails.HotelCode,
			"hotelImage" : hotelDetails.ImageUrls.HotelImage,
			"price" : Array.isArray(hotelDetails.Rooms.Room) ? hotelDetails.Rooms.Room[0].AmountAfterTax : hotelDetails.Rooms.Room.AmountAfterTax,									
			"roomDetails" : Array.isArray(hotelDetails.Rooms.Room) ? hotelDetails.Rooms.Room[0] : hotelDetails.Rooms.Room,									
			"tax":process.env.HOTEL_TAX,
			"service":hotelDetails.Service,
			"starRating":hotelDetails.StarRating,
			"hotelSLNo":hotelDetails.HotelSLNo,
			"countryCode":body.countryCode,
			"townName":body.townName,
			"provinceId":provinceId
		};
		return data;
	}
	 getMybookingResponse(element){
		return {
			people:element.people,
			address:element.address,
			phone:element.phone,
			hotelName:element.hotelName,
			hotelImage:(element.hotelImage !== null &&  element.hotelImage != "")  ? element.hotelImage : process.env.hotelImage,
			checkInDate:element.checkInDate,
			checkOutDate:element.checkOutDate,
			hotelCode:element.hotelCode,
			hotelLike:element.hotelLike,
			hotelComment:element.hotelComment,
		}
	}
	sendBookingMail(data,email){
		try{
			const message =  `<html>
				<head>
					<title>Booking Mail</title>
				</head>
				<body>
					<table border='1'>
						<tr>
							<th>Hotel Name</th>
							<td>${data.hotelName}</td>
						</tr>
						<tr>
							<th>Hotel Address</th>
							<td>${data.address}</td>
						</tr>
						<tr>
							<th>Check In Date</th>
							<td>${data.checkInDate}</td>
						</tr>
						<tr>
							<th>Check Out Date</th>
							<td>${data.checkOutDate}</td>
						</tr>
						<tr>
							<th>Price</th>
							<td>${data.amount}</td>
						</tr>
						<tr>
							<th>Phone Number</th>
							<td>${data.phone}</td>
						</tr>
					</table>
				</body>
			</html>`;
			this.mailerService.sendMail({
				to: email,
				from: process.env.SUPPORT_EMAIL,
				subject: "Successfully booking",
				text: "Successfully booking",
				html: message
			});
		}
		catch(error){
			console.log("Internal server error : ",error);
			return false;
		}			   
	}
	@Post('hotelSearch')
	async hotelSearch(@Body() body, @Res() res) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter town name" });
                return false;
            }  
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
				console.log("Province id not found");
				res.status(HttpStatus.OK).json({success:false,  message: "Hotel not found..." });
            	return false;
            }            
            let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let hotelResult = await this.hotelService.searchHotel(parameter).then((response)=>{
				return response.status==200 ? response.data : false; 
			});			
			if(hotelResult) {
				console.log("hotelResult : ",hotelResult);
				const parser = xmlToJson({ attributeMode:true });
				let result = await parser.xmlToJson(hotelResult,async(error, json) => {
					if(error) {
						console.log("JSON Error",error);
						return false;
					}
					let hotelList = [];
					let response = {};
					const userId = (body.userId!=undefined && body.userId!='') ? body.userId : 0;
					console.log("Hotel Response : ",json);
					if (json.hasOwnProperty('HotelDetails')) {
						if(Array.isArray(json.HotelDetails.Hotel)) {
							for(let element of json.HotelDetails.Hotel) {	
								response = await this.createSearchHotelResponse(element,body,userId);
								if(response){
									hotelList.push(response);
								}
							}
							if(body.sortBy!==undefined){
								if(body.sortBy==2){
									hotelList.sort(function(a, b) { return Number(b.price) - Number(a.price)});
								}	
							}
						}
						else {
							response = await this.createSearchHotelResponse(json.HotelDetails.Hotel,body,userId);
							console.log("Response Single",response);
							if(response){
								hotelList.push(response);
							}
						}
						return hotelList;
					}
					else {
						return false;
					}					
				});
				if(result && result.length>0) {
					res.status(HttpStatus.OK).json({success:true, message: "Successfully get hotel",data:result});	
					return false;
				}
				else {
					console.log("Result Error : ",result);
					res.status(HttpStatus.OK).json({success:false, message: "Hotel not found..." });	
					return false;
				}
			}
			else {
				console.log("Hotel result Error : ",hotelResult);
				res.status(HttpStatus.OK).json({success:false, message: "Hotel not found..." });	
				return false;
			}
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('getHotelDetail')
	async getHotelDetail(@Req() request,@Body() body, @Res() res) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter town name" });
                return false;
            }   
            if (!body.hotelCode) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter hotel code" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({success:false, message: "Hotel not found..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let hotelResult = await this.hotelService.searchHotel(parameter).then((response)=>{
				return response.status==200 ? response.data : false; 
			});			
			if(hotelResult) {
				const parser = xmlToJson({ attributeMode:true });
				let result = await parser.xmlToJson(hotelResult,async(error, json) => {
					if(error) {
						console.log("JSON Error",error);
						return false;
					}					
					const userId = (body.userId!=undefined && body.userId!='') ? body.userId : 0;
					if (json.hasOwnProperty('HotelDetails')) {
						if(Array.isArray(json.HotelDetails.Hotel)){
							const hotelDetails = json.HotelDetails.Hotel.find(element=>(element.HotelCode==body.hotelCode));
							if(hotelDetails) {
								const response = await this.createSearchHotelDetailResponse(hotelDetails,userId);
								return response;
							}
							else {
								return false;
							}						
						}
						else {
							if(json.HotelDetails.Hotel.HotelCode == body.hotelCode){
								const response = await this.createSearchHotelDetailResponse(json.HotelDetails.Hotel,userId);
								return response;						
							}
							return false;
						}	
					}
					else{
						return false;
					}
				});
				if(result) {
					res.status(HttpStatus.OK).json({success:true, message: "Successfully get hotel details",data:result});	
					return false;
				}
				else {
					res.status(HttpStatus.OK).json({success:false, message: "Hotel not found..." });	
					return false;
				}
			}
			else {
				res.status(HttpStatus.OK).json({success:false,message: "Hotel not found..." });
            	return false;
			}				
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}
	
	@Post('getCommentByHotelCode')
	async getCommentByHotelCode(@Body("hotelCode") hotelCode:string,@Body("userId") userId:number, @Res() res) {
		try {
			if (!hotelCode) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter hotel code" });
                return false;
			}
			let [like,totalLike] = await this.hotelService.countHotelLikeByHotelCode(hotelCode);		
			let [comment,totalComment] = await this.hotelService.countHotelCommentByHotelCode(hotelCode);		
			let isUserLike = await this.hotelService.checkUserLike(hotelCode,userId);		
			let commentList = await this.hotelService.getCommentByHotelCode(hotelCode,userId);				
			commentList.forEach((element,index)=>{
				commentList[index]["hotelDisLike"] = Number(commentList[index]["hotelDisLike"]);
				commentList[index]["hotelLike"] = Number(commentList[index]["hotelLike"]);
				commentList[index]["isDisLike"] = Number(commentList[index]["isDisLike"]);
				commentList[index]["isLike"] = Number(commentList[index]["isLike"]);
				commentList[index]["photo"] =  (commentList[index]["photo"] !=="" && commentList[index]["photo"] !==null)  ? (process.env.IMAGE_UPLOAD_PATH + commentList[index]["photo"])  : process.env.USER_DEFAULT_IMAGE_PATH;
			});
			let result = { 
				isLike:isUserLike ? Number(isUserLike.isLike) : 0,
				commentList: commentList,
				like: Number(totalLike),
    			comment: Number(totalComment)
			};	
			res.status(HttpStatus.OK).json({success:true, message: "Successfully get comment list",data:result});	
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('commentLikeById')
	@UseGuards(AuthGuard)
	async commentLikeById(@Body("commentId") commentId:number,@Body("userId") userId:number,@Body("isLike") isLike:number,@Res() res) {
		try {
			if (!userId) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter user id" });
                return false;
			}
			if (!commentId) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter comment id" });
                return false;
			}	
			const  result = await this.hotelService.commentLikeById(commentId,isLike,userId);
			if(result) {
				if(isLike==1) {
					res.status(HttpStatus.OK).json({success:true, message: "Successfully add comment like"});	
				}
				else {
					res.status(HttpStatus.OK).json({success:true, message: "Successfully add comment dislike"});	
				}
			}
			else {
				res.status(HttpStatus.OK).json({success:false, message: "Something went wrong,Please try again later..."});	
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}
	
	@Post('hotelComment')
	@UseGuards(AuthGuard)
	async hotelComment(@Body("comment") comment:string,@Body("userId") userId:number,@Body("hotelCode") hotelCode:string,@Res() res) {
		try {
			if (!userId) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter user id" });
                return false;
			}	
			if (!comment) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter comment" });
                return false;
			}	
			if (!hotelCode) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter hotel code" });
                return false;
			}	
			const  result = await this.hotelService.userComment(userId,hotelCode,comment)
			if(result) {
				res.status(HttpStatus.OK).json({success:true, message: "Successfully add comment"});	
			}
			else {
				res.status(HttpStatus.OK).json({success:false, message: "Something went wrong,Please try again later..."});	
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('hotelLike')
	@UseGuards(AuthGuard)
	async hotelLike(@Body() request: UserLike, @Res() res) {
		try {
			if (!request.hotelCode) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter hotel code" });
                return false;
			}
			if (!request.userId) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter user Id" });
                return false;
			}
			const  result = await this.hotelService.userLike(request.userId,request.hotelCode,request.isLike);
			if(result) {
				if(request.isLike==1){
					res.status(HttpStatus.OK).json({success:true,message: "Successfully add like"});
				}
				else {
					res.status(HttpStatus.OK).json({success:true,message: "Successfully add dislike"});
				}
			}
			else {
				res.status(HttpStatus.OK).json({success:false, message: "Something went wrong,Please try again later..."});	
			}
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong,Please try again later..." });
		}
	}	

	@Post('getBookingDetail')
	@UseGuards(AuthGuard)
	async getBookingDetail(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!body.countryCode) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter country code" });
                return false;
            }
            if (!body.checkInDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check in date" });
                return false;
            }
            if (!body.checkOutDate) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter check out date" });
                return false;
            }
            if (!body.rooms) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter rooms" });
                return false;
            }
            if (!body.adults) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter adults" });
                return false;
            }
            if (!body.townName) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter town name" });
                return false;
            }   
            if (!body.hotelCode) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter hotel code" });
                return false;
            }            
            const provinceId = await this.hotelService.getProviceCodeByTownName(body.townName).then(response=>{return (response) ? response.provinceId : "";});
            if(provinceId==""){
            	res.status(HttpStatus.OK).json({success:false, message: "Hotel not found..." });
            	return false;
            }
			let parameter = this.createSearchHotelXmlFormat(body,provinceId);			
			let hotelResult = await this.hotelService.searchHotel(parameter).then((response)=>{
				return response.status==200 ? response.data : false; 
			});			
			if(hotelResult) {
				const parser = xmlToJson({ attributeMode:true });
				let result = await parser.xmlToJson(hotelResult,async(error, json) => {
					if(error) {
						console.log("JSON Error",error);
						return false;
					}					
					const userId = userLoginid;
					if (json.hasOwnProperty('HotelDetails')) {
						if(Array.isArray(json.HotelDetails.Hotel)){						
							const hotelDetails = json.HotelDetails.Hotel.find(element=>(element.HotelCode==body.hotelCode));
							if(hotelDetails) {
								return this.bookingDetailResponse(body,hotelDetails,provinceId);
							}
							return false;
						}
						else {
							if(json.HotelDetails.Hotel.HotelCode==body.hotelCode){
								return this.bookingDetailResponse(body,json.HotelDetails.Hotel,provinceId);
							}
							return false;
						}	
					}
					else {
						return false;
					}
				});
				if(result) {
					res.status(HttpStatus.OK).json({success:true, message: "Successfully booking details",data:result});	
					return false;
				}
				else {
					res.status(HttpStatus.OK).json({success:false, message: "Booking details not found..." });	
					return false;
				}
			}
			else {
				res.status(HttpStatus.OK).json({success:false,message: "Booking details not found..." });
            	return false;
			}				
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('payment')
	@UseGuards(AuthGuard)	
 	async payment(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try{
			if(!body.cardNumber){
				res.status(HttpStatus.OK).json({success:false,message:"Please enter card number"});
				return false;
			}
			if(!body.expiryDate){
				res.status(HttpStatus.OK).json({success:false,message:"Please enter expiry date"});
				return false;
			}
			if(!body.securityCode){
				res.status(HttpStatus.OK).json({success:false,message:"Please enter security code"});
				return false;
			}
			if(!body.amount){
				res.status(HttpStatus.OK).json({success:false,message:"Please enter amount"});
				return false;
			}
			if(!body.hotelCode){
				res.status(HttpStatus.OK).json({success:false,message:"Please enter hotel code"});
				return false;
			}			
			const userResult = await this.hotelService.getUserDetails(userLoginid);
			if(userResult){
				const parameter = this.createHotelPreBookingXmlFormat(body,body.provinceId);
				const hotelPreBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
					return (response.status==200) ? response.data : false;  
				});	
				if(hotelPreBookingResult){
					const parser = xmlToJson({ attributeMode:true });
					const result = await parser.xmlToJson(hotelPreBookingResult, (error, json) => {
						if(error) {
							console.log("Errors : ",error);
							res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
							return false;
						}
						if(json.hasOwnProperty('OTA_HotelResRS')){
							return false;
						}
						if(json.hasOwnProperty('HotelPreBookingResponse')){
							return json.HotelPreBookingResponse.HotelReservation;
						}
					});
					if(result) {
						const name = userResult.name.split(" ");
						const data = {
							"hotelSLNo":body.hotelSLNo,
							"service":result.Service,
							"starRating":body.starRating,
							"hotelCode":result.HotelDetails.HotelCode,
							"hotelName":result.HotelDetails.HotelName,
							"preBookingRequestId":result.ReservationId,
							"roomNo":body.roomNo,
							"age":body.age,
							"count":body.count,
							"firstName":(name[0] && name[0]!="") ? name[0] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
							"lastName":(name[1] && name[1]!="") ? name[1] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
							"gender":body.gender,
							"passengerType":body.passengerType,
							"countryCode":body.countryCode,
						};
						const parameter = this.createConfirmBookingRequest(data);
						const hotelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
							return (response.status==200) ? response.data : false;  
						});	
						if(hotelBookingResult){
							const parser = xmlToJson({ attributeMode:true });
							const result = await parser.xmlToJson(hotelBookingResult, (error, json) => {
								if(error) {
									console.log("Errors : ",error);
									res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
									return false;
								}
								if(json.hasOwnProperty("HotelBookingResponse")) {
									return json.HotelBookingResponse;
								}
								else {
									return false;
								}
							});	
							if(result) {
								const data = {
									"userId":userResult.id,
									"hotelCode":body.hotelCode,
									"cardHolderName":"Test",
									"cardNumber":body.cardNumber,
									"expiryDate":body.expiryDate,
									'securityCode':body.securityCode,
									"amount":(Number(body.amount) * 100),
									"firstName":(name[0] && name[0]!="") ? name[0]:(userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
									"lastName":(name[1] && name[1]!="") ? name[1]:(userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
									"description":"Hotel Booking Payment",
									"vendorTxCode":this.generateRandomToken()			
								}		
								console.log("parameter ",data);
								const paymentResult = await this.hotelService.getMerchantSessionKey(data);
								console.log("Payment Result :- ",paymentResult);
								if(paymentResult){
									if(paymentResult.hasOwnProperty("status")){
										if(paymentResult.status=='Ok'){
											const params = {
												transactionId:paymentResult.transactionId,	
												userId:userLoginid,	
												phone:body.phone,	
												hotelCode:body.hotelCode,	
												hotelName:body.hotelName,	
												checkInDate:body.checkInDate,	
												checkOutDate:body.checkOutDate,	
												hotelImage:body.hotelImage,	
												address:body.location,	
												adults:body.adults ? body.adults : 0,	
												rooms:body.rooms ? body.rooms : 0,
												children:body.children ? body.children : 0,
												amount:body.amount,
												paymentType:1,
												reservationId:result.HotelReservation.ReservationId
											};
											this.hotelService.transaction(params).then(response=>{
												if(response) {
													this.sendBookingMail(params,userResult.email);
													res.status(HttpStatus.OK).json({success:true,message: "Successfully booking",data:{bookingId:response.raw.insertId}});						
												}
												else {
													res.status(HttpStatus.OK).json({success:false,message: "Something went wrong,Please try again later..." });			
												}
											});
										}
										else {
											const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
											const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
												return (response.status==200) ? response.data : false;  
											});
											if(cancelBookingResult){
												const parser = xmlToJson({ attributeMode:true });
												const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
													if(error) {
														res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
														return false;
													}
													if(json.hasOwnProperty("HotelCancelBooking")) {
														if(json.HotelCancelBooking.Status=='Cancelled') {
															res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
															return false;
														}
													}
													res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
													return false;
												});
											}
											else {
												res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
												return false;
											}				
										}										
									}
									else {
										const error = Array.isArray(paymentResult) ? ((paymentResult[0].description !=undefined && paymentResult[0].description!=null) ? paymentResult[0].description : "Something went wrong,Please try again later...")  : ((paymentResult.description !=undefined && paymentResult.description!=null) ? paymentResult.description : "Something went wrong,Please try again later...");	
										const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
										const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
											return (response.status==200) ? response.data : false;  
										});
										if(cancelBookingResult){
											const parser = xmlToJson({ attributeMode:true });
											const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
												if(error) {
													res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
													return false;
												}
												if(json.hasOwnProperty("HotelCancelBooking")) {
													if(json.HotelCancelBooking.Status=='Cancelled') {
														res.status(HttpStatus.OK).json({ success:false,message:error});									
														return false;
													}
												}
												res.status(HttpStatus.OK).json({ success:false,message:error});									
												return false;
											});
										}
										else {
											res.status(HttpStatus.OK).json({ success:false,message:error});									
											return false;
										}				
									}
								}
								else {						
									const parameter = this.createCancelBookingRequest({"ReservationId":result.HotelReservation.ReservationId});
									const cancelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
										return (response.status==200) ? response.data : false;  
									});
									if(cancelBookingResult){
										const parser = xmlToJson({ attributeMode:true });
										const result = await parser.xmlToJson(cancelBookingResult, (error, json) => {
											if(error) {
												res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
												return false;
											}
											if(json.hasOwnProperty("HotelCancelBooking")) {
												if(json.HotelCancelBooking.Status=='Cancelled') {
													res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
													return false;
												}
											}
											res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
											return false;
										});
									}
									else {
										res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
										return false;
									}
								}
							}
						}
						else {
							console.log("Payment issuse");
							res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
						}
					}	
					else {
						console.log("Confirm booking isssue");
						res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
					}
				}
				else {
					console.log("Confirm booking isssue");
					res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
				}
			}
			else {
				console.log("User not found");
				res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
			}
		}
		catch(error){
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message: "Something went wrong,Please try again later..." });
		}
	}

	@Post('transaction')
	@UseGuards(AuthGuard)	
 	async transaction(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try{
			const userResult = await this.hotelService.getUserDetails(userLoginid);
			if(userResult){
				const parameter = this.createHotelPreBookingXmlFormat(body,body.provinceId);
				const hotelPreBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
					return (response.status==200) ? response.data : false;  
				});	
				if(hotelPreBookingResult){
					const parser = xmlToJson({ attributeMode:true });
					const result = await parser.xmlToJson(hotelPreBookingResult, (error, json) => {
						if(error) {
							console.log("Errors : ",error);
							res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
							return false;
						}
						if(json.hasOwnProperty('OTA_HotelResRS')){
							return false;
						}
						if(json.hasOwnProperty('HotelPreBookingResponse')){
							return json.HotelPreBookingResponse.HotelReservation;
						}
					});
					if(result) {
						const name = userResult.name.split(" ");
						const data = {
							"hotelSLNo":body.hotelSLNo,
							"service":result.Service,
							"starRating":body.starRating,
							"hotelCode":result.HotelDetails.HotelCode,
							"hotelName":result.HotelDetails.HotelName,
							"preBookingRequestId":result.ReservationId,
							"roomNo":body.roomNo,
							"age":body.age,
							"count":body.count,
							"firstName":(name[0] && name[0]!="") ? name[0] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
							"lastName":(name[1] && name[1]!="") ? name[1] : (userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
							"gender":body.gender,
							"passengerType":body.passengerType,
							"countryCode":body.countryCode,
						};
						const parameter = this.createConfirmBookingRequest(data);
						const hotelBookingResult = await this.hotelService.hotelBooking(parameter).then((response)=>{
							return (response.status==200) ? response.data : false;  
						});	
						if(hotelBookingResult){
							const parser = xmlToJson({ attributeMode:true });
							const result = await parser.xmlToJson(hotelBookingResult, (error, json) => {
								if(error) {
									console.log("Errors : ",error);
									res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
									return false;
								}
								if(json.hasOwnProperty("HotelBookingResponse")){
									return json.HotelBookingResponse;
								}
								else{
									return false;
								}
							});	
							if(result) {
								const data = {
									"userId":userResult.id,
									"hotelCode":body.hotelCode,
									"cardHolderName":"Test",
									"cardNumber":body.cardNumber,
									"expiryDate":body.expiryDate,
									'securityCode':body.securityCode,
									"amount":(Number(body.amount) * 100),
									"firstName":(name[0] && name[0]!="") ? name[0]:(userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
									"lastName":(name[1] && name[1]!="") ? name[1]:(userResult.name &&  userResult.name!="") ? userResult.name : 'new user',
									"description":"Hotel Booking Payment",
									"vendorTxCode":this.generateRandomToken()			
								};		
								const params = {
									transactionId:body.transctionId,	
									userId:userLoginid,	
									phone:body.phone,	
									hotelCode:body.hotelCode,	
									hotelName:body.hotelName,	
									checkInDate:body.checkInDate,	
									checkOutDate:body.checkOutDate,	
									hotelImage:body.hotelImage,	
									address:body.location,	
									adults:body.adults ? body.adults : 0,	
									rooms:body.rooms ? body.rooms : 0,
									children:body.children ? body.children : 0,
									amount:body.amount,
									paymentType:2,
									reservationId:result.HotelReservation.ReservationId
								};
								console.log("Parameter list : ",params);
								this.hotelService.transaction(params).then(response=>{
									if(response) {
										res.status(HttpStatus.OK).json({success:true,message: "Successfully booking",data:{bookingId:response.raw.insertId}});						
									}
									else {
										res.status(HttpStatus.OK).json({success:false,message: "Something went wrong,Please try again later..." });			
									}
								});								
							}
						}
						else {
							res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
						}
					}	
					else {
						res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
					}
				}
				else {
					res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
				}
			}
			else {
				res.status(HttpStatus.OK).json({ success:false,message: "Something went wrong,Please try again later..." });
			}
		}
		catch(error){
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message: "Something went wrong,Please try again later..." });
		}
	}	

	@Get('getmybooking')
	@UseGuards(AuthGuard)	
	async getMyBooking(@Req() request,@Body() body, @Res() res,@Param("userLoginid") userLoginid:number) {
		try {
			if (!userLoginid) {
                res.status(HttpStatus.OK).json({success:false, message: "Please enter user id" });
                return false;
			}
			let currentBooking = await this.hotelService.getCurrentBooking(userLoginid);
			let pastBooking = await this.hotelService.getPastBooking(userLoginid);
			let current = [];
			let past = [];
			currentBooking.forEach((element) => {
				current.push(this.getMybookingResponse(element));				
			});
			pastBooking.forEach((element) => {
				past.push(this.getMybookingResponse(element));
			});
			let data = {currentBooking:current,pastBooking:past};
			res.status(HttpStatus.OK).json({success:true,message: "Successfully get my booking",data:data});										
		}
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message: "Something went wrong,Please try again later..." });
		}
	}
	

	@Get('getnotification')
	@UseGuards(AuthGuard)
	async getNotification(@Param("userLoginid") userLoginid:number,@Res() res) {
		try {
			const  result = await this.hotelService.getNotification(userLoginid);
			if(result) {
				let data = [];
				result.forEach(element => {
					data.push({
						date:element.date,
						message:element.time + "before your checkout !"
					});
				});	
				res.status(HttpStatus.OK).json({success:true,message: "Successfully get notification list",data:data});	
			}
			else {
				res.status(HttpStatus.OK).json({success:false,message: "Something went wrong,Please try again later..."});	
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "Something went wrong,Please try again later..."});
		}
	}

	@Post('getbookingbyid')
	@UseGuards(AuthGuard)
	async getBookingById(@Body("bookingId") bookingId:number,@Res() res) {
		try {
			if (!bookingId) {
                res.status(HttpStatus.OK).json({success:false,message: "Please enter booking id" });
                return false;
			}	
			const  result = await this.hotelService.getBookingById(bookingId);
			if(result){
				if(result.length > 0){
					res.status(HttpStatus.OK).json({success:true,message: "Successfully get booking details...",data:result[0]});
				}
				else{
					res.status(HttpStatus.OK).json({success:false,message: "Hotel booking not found..."});
				}
			}
			else {
				res.status(HttpStatus.OK).json({success:false,message: "Hotel booking not found..."});
			}
		}		
		catch (error) {
			console.log("Internal server error : ",error);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message: "Something went wrong,Please try again later..."});
		}
	}
	
	// End web api

	// Start xml booking format	
	
	

	// Create cancel booking request format
	createCancelBookingRequest(data) {
		try {
			return `<?xml version="1.0" encoding="utf-8"?>
			<BookingCancelRQ Version="2" CancelType="Cancel">
			<BookingChannel Type="TRP"/>
			<UniqueID ID="${data.ReservationId}"/>
			</BookingCancelRQ>`;
		}
		catch(error) {
			console.log("Internal server error : ",error);
			return false;
		}
	}

	// End xml booking format
}	