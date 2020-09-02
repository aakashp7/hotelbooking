import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In,Not } from 'typeorm';
import { Md5 } from "md5-typescript";
import { User } from 'src/entity/user.entity';
import { UserRequest } from 'src/entity/user-request.entity';
import { Message } from 'src/entity/message.entity';
import { CustomerSupport } from 'src/entity/customer-support.entity';
import { Connection } from "typeorm";
import { from } from 'rxjs';



@Injectable()
export class UserService {

    constructor(
        private readonly connection:Connection,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserRequest) private userRequestRepository: Repository<UserRequest>,
        @InjectRepository(Message) private messageRepository: Repository<Message>,
        @InjectRepository(CustomerSupport) private customerSupportRepository: Repository<CustomerSupport>
    ) { }

	async checkAccountExist(email: string) {
		try {          
			return this.userRepository.findOne({
				select: ['id', 'name', 'email'],
				where: { email: email, status: 0 }
			});
		}
		catch (error) {
			return false;
		}
    }
    
    async checkUserId(id:number) {
		try {          
			return this.userRepository.findOne({
				select: ['id'],
				where: { id:id }
			});
		}
		catch (error) {
			return false;
		}
	}
	
	async updatePasswordById(userId: number,password:string) {
		try {          
			password = Md5.init(password);
			await this.userRepository.update(userId, { password: password });
		}
		catch (error) {
			return false;
		}
	}
	
    async register(user: User) {
        try {          
			user.password = Md5.init(user.password);
			user.status =0;
			user.name =user.email.substr(0,user.email.indexOf("@"));
			user.username =user.email.substr(0,user.email.indexOf("@"));			
            return this.userRepository.insert(user);
        }
        catch (error) {
            return false;
        }
    }
	
	

    async checkEmailIdExist(email: string, userId: number) {
        try {
            if (userId != 0) {
                return this.userRepository.findOne({
                    select: ['id', 'name', 'email'],
                    where: { email: email, id:Not(userId), status: 1 }
                });
            }
            else {
                return this.userRepository.findOne({
                    select: ['id', 'name', 'email'],
                    where: { email: email, status: 1 }
                });
            }
        }
        catch (error) {
            return false;
        }
    }

    async socialLogin(user: User) {
        try {
            return this.userRepository.findOne({
                select: ['id', 'name', 'email','photo','description','isCommunity','totalBookingNight','age'],
                where: { appId: user.appId, status: 1 }
            });
        }
        catch (error) {
            return false;
        }
    }

    async login(user: User) {
        try {
            user.password = Md5.init(user.password);
            return this.userRepository.findOne({
                select: ['id','photo' ,'name', 'email', 'status'],
                where: { email: user.email, password: user.password, status: In([0, 1]) }
            });
        }
        catch (error) {
            return false;
        }
    }

    async updateTokenByUserId(accessToken: string, id: number) {
        try {
            let user = await this.userRepository.findOne(id);
            user.accessToken = accessToken;
            await this.userRepository.save(user);
        }
        catch (error) {
            return false;
        }
    }

    async activeUserAccount(userId: number) {
        try {
            return this.userRepository.findOne({
                select: ['id', 'name', 'email', 'accessToken'],
                where: { id: userId }
            });
        }
        catch (error) {
            return false;
        }
    }

    async updateStatusByUserId(userId: number) {
        try {
            await this.userRepository.update(userId, { status: 1 });
        }
        catch (error) {
            return false;
        }
    }

    async insertSocialLoginDetail(user: User) {
        try {
            return this.userRepository.insert(user);
        }
        catch (error) {
            return false;
        }
    }
    
    async getUserDetailsByUserId(userId: number) {
        try {
            return this.userRepository.findOne({
                select: ['id', 'name', 'email','photo','description','isCommunity','totalBookingNight','age'],
                where: { id: userId }
            });
        }
        catch (error) {
            return false;
        }
    }

    async updateProfileByUserId(userId: number, data) {
        try {
            return this.userRepository.update(userId,data);
        }
        catch (error) {
            return false;
        }
    }

    async forgotPassword(email: string) {
        try {           
            return this.userRepository.findOne({
                select: ['id', 'name', 'email'],
                where: { email: email,status:1}
            });
        }
        catch (error) {
            return false;
        }
    }

    async changePasswordByUserId(user: User) {
        try {           
            const password = Md5.init(user.password);
            await this.userRepository.update(user.id, { password: password });
        }
        catch (error) {
            return false;
        }
    }    

    async signup(user: any) {
        try {          
			user.password = Md5.init(user.password);
            user.status = 0;		
            user.name = user.firstName+" "+user.lastName;		
            return this.userRepository.insert(user);
        }
        catch (error) {
            return false;
        }
    }


    async signin(user: User) {
        try {
            user.password = Md5.init(user.password);
            return this.userRepository.findOne({
                select: ['id', 'name', 'email','photo','description','isCommunity','totalBookingNight','age','status'],
                where: { email: user.email, password: user.password, status: In([0, 1]) }
            });
        }
        catch (error) {
            return false;
        }
    }

    async getTotalUser() {
        try {
            return this.userRepository.count({
                where: { status: In([0, 1]) }
            })
        }
        catch (error) {
            return false;
        }
    }

    async getUserList() {
        try {
            return this.userRepository.find({
                select: ['id', 'name','username', 'email'],
                where: { status:In([0,1])},
                order: {id:"DESC"}
            });
        }
        catch (error) {
            return false;
        }
    }

    async deleteUserById(userId: number) {
        try {
            await this.userRepository.update(userId, { status:2 });
        }
        catch (error) {
            return false;
        }
    }

    async addNewUser(user: User) {
        try {          
			user.password = Md5.init(user.password);
			user.name =user.name;
			user.username =user.username;
			user.email = user.email;			
            return this.userRepository.insert(user);
        }
        catch (error) {
            return false;
        }
    }   

    async getUserListByCityName(city: string) {
        try {
            return this.userRepository.find({
                select: ['id', 'name'],
                where: { status:1}
            });
        }
        catch (error) {
            return false;
        }
    }    

    async sendRequest(fromUserId:number,toUserId:number) {
        try {
            let user = {fromUserId:fromUserId,toUserId:toUserId}; 
            return this.userRequestRepository.insert(user);
        }
        catch (error) {
            return false;
        }
    }

    async getLastMessageByUserId(userId: number,city:string) {
        try {
            let query = ``;
            return this.connection.query(query);     
        }
        catch (error) {
            return false;
        }
    } 

    async sendMessage(fromUserId:number,toUserId:number,message:string) {
        try {
            const data ={fromUserId:fromUserId,toUserId:toUserId,message:message}; 
           
            return this.messageRepository.insert(data);
        }
        catch (error) {
            return false;
        }
    }            
    
    async checkUserRequest(fromUserId:number,toUserId:number) {
        try {
            return this.userRepository.findOne({
                select: ['id', 'name'],
                where: {fromUserId:fromUserId,toUserId:toUserId,status:1}
            });
        }
        catch (error) {
            return false;
        }
    }     
    async updateStatus(userId: number,userActive:number) {
        try {
            await this.userRepository.update(userId, { userActive: userActive });
        }
        catch (error) {
            return false;
        }
    }
    async getSocketIdByUserId(userId: number) {
        try {
            return this.userRepository.findOne({
                select: ['socketId'],
                where: {id:userId}
            });
        }
        catch (error) {
            return false;
        }
    }
    async getMessageListByUserId(fromUserId:number,toUserId:number,page:number) {
        try {
                page = (page - 1)  * 15;
                let query = ` `;
                          
                 return this.connection.query(query);     
        }
        catch (error) {
            return false;
        }
    } 
    async getMessageList(userLoginid) {
        try {             
                let query = `SELECT message.fromUserId AS sender_id,U.name AS name,message.message AS message,message.createdAt AS 'time'
                            FROM (SELECT MAX(id) AS id FROM message AS M WHERE toUserId = ${userLoginid}  GROUP BY fromUserId) 
                            AS M INNER JOIN message AS message ON M.id = message.id INNER JOIN user AS U ON U.id = message.fromUserId AND U.status='1' ORDER BY M.id DESC`;
                return this.connection.query(query);     
        }
        catch (error) {
            return false;
        }
    } 
    async updateProfile(userId: number,name:string,email:string) {
        try {
            await this.userRepository.update(userId, {email:email,name:name});
        }
        catch (error) {
            return false;
        }
    }
    async customerSupport() {
        try {
            return this.customerSupportRepository.findOne( {order: { id: 'DESC' }} );
        }
        catch (error) {
            return false;
        }
    }    
}