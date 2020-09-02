import { Injectable,HttpService  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from "typeorm";
import { Repository, In, } from 'typeorm';
import  * as btoa from 'btoa';
import { Hotel } from 'src/entity/hotel.entity';
import { HotelBooking } from 'src/entity/hotel-booking.entity';
import { UserLike } from 'src/entity/user-like.entity';
import { UserComment } from 'src/entity/user-comment.entity';
import { Country } from 'src/entity/country.entity';
import { User } from 'src/entity/user.entity';


@Injectable()
export class HotelService {
    
    constructor(
        @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Country) private countryRepository: Repository<Country>,
        @InjectRepository(UserLike) private userLikeRepository: Repository<UserLike>,
        @InjectRepository(UserComment) private userCommentRepository: Repository<UserComment>,
        @InjectRepository(HotelBooking) private hotelBookingRepository: Repository<HotelBooking>,
        private http: HttpService,
        private connection: Connection,
    ) { }

	async addNewHotel(data) {
		try {          
			if(data.hotelCode){
                const response = await this.hotelRepository.findOne({
                    select: ['id'],
                    where: { hotelCode:data.hotelCode }
                });                    
                if(response){
                    return this.hotelRepository.update({ hotelCode:data.hotelCode },data);          
                }
                else {
                    return this.hotelRepository.insert(data);       
                }               
            }    
            else{
                return this.hotelRepository.insert(data);    
            }            
		}
		catch (error) {
			return false;
		}
	}

	async getHotelList() {
        try {
            return this.hotelRepository.find({
                select: ['id', 'hotelName','country','state','city','postalcode','address'],
                where: { status:In([0,1])},
                order: {id:"DESC"}
            });
        }
        catch (error) {
            return false;
        }
    }
    async userLike(userId,hotelCode,isLike) {
        try {          
            const response =  await this.userLikeRepository.findOne({
                select: ['id'],
                where: { userId:userId,hotelCode:hotelCode,status:1}
            });
            if(response) {
                return this.userLikeRepository.update({ id:response.id},{userId,hotelCode,isLike});          
            }
            else {
                return this.userLikeRepository.insert({ userId,hotelCode,isLike});       
            }                                    
        }
        catch (error) {
            return false;
        }
    }
    async userComment(userId,hotelCode,comment) {
        try {          
            return this.userCommentRepository.insert({ userId,hotelCode,comment});      
        }
        catch (error) {
            return false;
        }
    }
    async searchHotel(data):Promise<any>  {
        try {          
              return this.http.post(process.env.HOTEL_API_URL,data,{ headers: {Accept: "text/plain","Content-Type":"text/plain"}}).toPromise(); 
        }
        catch (error) {
            return false;
        }
    }

    async countHotelLikeByHotelCode(hotelCode) {        
        return await this.userLikeRepository.findAndCount({where:{hotelCode,status:1,isLike:1}});
    }

    async countHotelCommentByHotelCode(hotelCode) {        
        return await this.userCommentRepository.findAndCount({where:{hotelCode,status:1}});
    }

    async getCommentListByHotelCode(hotelCode) {        
        try {
            let query = ``;
            return this.connection.query(query);     
        }
        catch(error) {
            return false;
        }
    }

    async getCommentByHotelCode(hotelCode,userId) {        
        try {
            let query = `SELECT user_comment.id,name,comment,photo,(SELECT COUNT(*) FROM user_like WHERE commentId = user_comment.id AND isLike=1 AND status=1) AS hotelLike,(SELECT COUNT(*) FROM user_like WHERE commentId = user_comment.id AND isLike=0 AND status=1) AS hotelDisLike,IF(TIMESTAMPDIFF(YEAR, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(YEAR, user_comment.createdAt, NOW())," ","year ago"),IF(TIMESTAMPDIFF(MONTH, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(MONTH, user_comment.createdAt, NOW())," ","month ago"),IF(TIMESTAMPDIFF(DAY, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(DAY, user_comment.createdAt, NOW())," ","day ago"),IF(TIMESTAMPDIFF(HOUR, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(HOUR, user_comment.createdAt, NOW())," ","hour ago"),IF(TIMESTAMPDIFF(MINUTE, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(MINUTE, user_comment.createdAt, NOW())," ","minute ago"),IF(TIMESTAMPDIFF(SECOND, user_comment.createdAt, NOW()) > 0,CONCAT(TIMESTAMPDIFF(SECOND, user_comment.createdAt, NOW())," ","second ago"),'1 second ago')))))) AS time,IF((SELECT COUNT(*) FROM user_like WHERE commentId=user_comment.id AND isLike=1 AND userId=${userId} AND status=1)=0,0,1) AS isLike,IF((SELECT COUNT(*) FROM user_like WHERE commentId=user_comment.id AND isLike=0 AND userId=${userId} AND status=1)=0,0,1) AS isDisLike FROM user_comment INNER JOIN user ON user.id = user_comment.userId WHERE user_comment.hotelCode=${hotelCode} AND user_comment.status=1 ORDER BY user_comment.createdAt  DESC`;
            return this.connection.query(query);     
        }
        catch(error) {
            return false;
        }
    }

    async getProviceCodeByTownName(townName) {
        try {          
             return this.countryRepository.findOne({
                select: ['provinceId'],
                where: { townName }
            });
        }
        catch (error) {
            return false;
        }
    }

    async hotelBooking(data):Promise<any>  {
        try {          
            return this.http.post(process.env.HOTEL_API_URL,data,{ headers: {"Accept": "text/plain","Content-Type":"text/plain"}}).toPromise(); 
        }
        catch (error) {
            return false;
        }
    }
    
    async commentLikeById(commentId,isLike,userId) {
		try {          			
            const response = await this.userLikeRepository.findOne({
                select: ['id','isLike'],
                where: { userId,commentId,status:1 }
            });                    
            if(response) {
                if(response.isLike==isLike){
                    return this.userLikeRepository.update({ id:response.id },{status:2});          
                }
                else {
                    return this.userLikeRepository.update({ id:response.id },{commentId,userId,isLike });          
                }
            }
            else {
                return this.userLikeRepository.insert({commentId,userId,isLike });       
            }                                       
		}
		catch (error) {
			return false;
		}
    }
    
    async checkUserLike(hotelCode,userId){  
        try{
            return this.userLikeRepository.findOne({
                select: ['id','isLike'],
                where: { userId,hotelCode,status:1 }
            });
        }
        catch (error) {
            return false;
        }
    }
    async getMerchantSessionKey(data){
        try{
            let params = {"vendorName":process.env.VENDOR_NAME};
            const result = await this.http.post(process.env.PAYMENT_API_URL + 'merchant-session-keys/',params,{ headers: {"Accept": "application/json","Content-Type":"application/json",'Authorization': 'Basic ' + btoa(process.env.INTEGRATION_KEY+":"+process.env.INTEGRATION_PASSWORD)}}).toPromise();   
            return this.getCardIdentifiers(data,result.data.merchantSessionKey);
        }
        catch (error) {
            console.log("Get merchant session key",error);
            return false;
        }
    }
    
    async getUserDetails(id){
        try{
            return this.userRepository.findOne(id);    
        }  
        catch(error) {            
            console.log("DB Error : ",error);
            return false;
        }
    }
    async transaction(params){
        try {
            return this.hotelBookingRepository.insert(params);
        }
        catch(error){
            console.log("DB Error : ",error);
            return false;
        }
    }

    async getCurrentBooking(userId){
        try {
            return this.connection.query(`SELECT phone,(adults + children) AS people,hotel_booking.address,hotel_booking.hotelName,hotel_booking.hotelImage,DATE_FORMAT(checkInDate,"%a %d %M") AS checkInDate,DATE_FORMAT(checkOutDate,"%a %d %M") as checkOutDate,hotel_booking.hotelCode,(SELECT count(*) FROM user_like WHERE  user_like.hotelCode = hotel_booking.hotelCode AND status=1 AND isLike=1) as hotelLike,(SELECT count(*) FROM user_comment WHERE  user_comment.hotelCode = hotel_booking.hotelCode AND status=1) as hotelComment FROM hotel_booking WHERE DATE_FORMAT(checkOutDate,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d") AND hotel_booking.userId = ${userId} `);
        }
        catch(error){
            console.log("DB Error : ",error);
            return false;
        }
    }
    
    async getPastBooking(userId){
        try {
            return this.connection.query(`SELECT phone,(adults + children) AS people,hotel_booking.address,hotel_booking.hotelName,hotel_booking.hotelImage,DATE_FORMAT(checkInDate,"%a %d %M") AS checkInDate,DATE_FORMAT(checkOutDate,"%a %d %M") as checkOutDate,hotel_booking.hotelCode,(SELECT count(*) FROM user_like WHERE  user_like.hotelCode = hotel_booking.hotelCode AND status=1 AND isLike=1) as hotelLike,(SELECT count(*) FROM user_comment WHERE  user_comment.hotelCode = hotel_booking.hotelCode AND status=1) as hotelComment FROM hotel_booking WHERE DATE_FORMAT(checkOutDate,"%Y-%m-%d") < DATE_FORMAT(NOW(),"%Y-%m-%d") AND hotel_booking.userId = ${userId}`);
        }
        catch(error){
            console.log("DB Error : ",error);
            return false;
        }
    }

    async getNotification(userId){
        try {
            return this.connection.query(`SELECT DATE_FORMAT(checkInDate,"%d/%m/%y") as date,IF(TIMESTAMPDIFF(YEAR,  NOW(),hotel_booking.checkInDate) > 0,CONCAT(TIMESTAMPDIFF(YEAR,  NOW(),hotel_booking.checkInDate),' ','year '),IF(TIMESTAMPDIFF(MONTH,  NOW(),hotel_booking.checkInDate) > 0,CONCAT(TIMESTAMPDIFF(MONTH,  NOW(),hotel_booking.checkInDate),' ','month '),IF(TIMESTAMPDIFF(DAY,  NOW(),hotel_booking.checkInDate) > 0,CONCAT(TIMESTAMPDIFF(DAY,  NOW(),hotel_booking.checkInDate),' ','days '),'1 days '))) AS time FROM hotel_booking WHERE userId = ${userId} AND checkInDate > DATE_FORMAT(NOW(),"%y-%m-%d") ORDER BY checkInDate ASC`);
        }
        catch(error){
            console.log("DB Error : ",error);
            return false;
        }
    }
    
    async getBookingById(bookingId){
        try {
            return this.connection.query(`SELECT user.email,phone,(adults + children) AS people,hotel_booking.address,hotel_booking.hotelName,hotel_booking.hotelImage,DATE_FORMAT(checkInDate,"%a %d %M") AS checkInDate,DATE_FORMAT(checkOutDate,"%a %d %M") as checkOutDate,hotel_booking.hotelCode,(SELECT count(*) FROM user_like WHERE  user_like.hotelCode = hotel_booking.hotelCode AND status=1 AND isLike=1) as hotelLike,(SELECT count(*) FROM user_comment WHERE  user_comment.hotelCode = hotel_booking.hotelCode AND status=1) as hotelComment FROM hotel_booking INNER JOIN user ON user.id =hotel_booking.userId  WHERE DATE_FORMAT(checkOutDate,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d") AND hotel_booking.id = ${bookingId}`);
        }
        catch(error){
            console.log("DB Error : ",error);
            return false;
        }
    }
}



