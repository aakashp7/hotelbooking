import { Controller, Post, Body, Res, Get, HttpStatus, Query, UseGuards, Param,UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Jwtresponse } from 'src/model/jwtresponse.interface';
import { UserRequest } from 'src/entity/user-request.entity';
import { MailerService } from '@nest-modules/mailer';
import { Message } from 'src/entity/message.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JWTAuthGuard } from 'src/auth/jwtauth.guard';
import { User } from 'src/entity/user.entity';
import * as jwt from 'jsonwebtoken';
import * as randtoken from 'rand-token';
import { diskStorage } from 'multer';
import { extname } from 'path';

const tokenList = {};
const config = {
	"secret": "",
	"refreshTokenSecret": "",
	"port": ,
	"tokenLife": ,
	"refreshTokenLife": 
};

@Controller('api/')
export class UserController {
    constructor(
        private userService: UserService,
        private mailerService: MailerService
    ) { }

    generateRandomToken():string{
        return randtoken.generate(30);   
    }

    sendMail(fromMail,toMail,subject,message,text){
        this.mailerService.sendMail({
            to: fromMail,
            from: toMail,
            subject: subject,
            text: message,
            html: text
        });
    }

    @Post('register')
    register(@Body() user: User, @Res() res): boolean {
        try {        	        	
            if (!user.email) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter email id" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter password" });
                return false;
            }
            this.userService.checkAccountExist(user.email).then((data) => {
                if (data) {
                    this.userService.updatePasswordById(data.id, user.password).then((response) => {
                        const button = `<a href="${process.env.BASE_PATH}dashboard/${data.id}" target="_blank">Active your account</a>`;
                        this.sendMail(process.env.SUPPORT_EMAIL,user.email,'Successfully registration','Successfully registration',button);
                        const responseData = { isNewUser: false };
                        res.status(HttpStatus.OK).json({ success: true, message: "Successfully register", data: responseData });
                    });
                }
                else {
                    this.userService.register(user).then((response) => {
                        if (response) {
                            const button = `<a href="${process.env.BASE_PATH}dashboard/${response.raw.insertId}" target="_blank">Active your account</a>`;
                            this.sendMail(process.env.SUPPORT_EMAIL,user.email,'Successfully registration','Successfully registration',button);
                            const responseData = { isNewUser: true };
                            res.status(HttpStatus.OK).json({ success: true, message: "Successfully register", data: responseData });
                        }
                        else {
                            res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                        }
                    });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }
    
    @Post('socialLogin')
    socialLogin(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.name) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter name" });
                return false;
            }
            if (!user.appId) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter appId" });
                return false;
            }
            this.userService.socialLogin(user).then((response) => {
                if (response) {
                    const payload = { id: response.id };
                    response.accessToken = this.generateRandomToken();
                    response.photo = (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH;
                    this.userService.updateTokenByUserId(response.accessToken, response.id);
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully login", data: response });
                }
                else {
                    this.userService.insertSocialLoginDetail(user).then((response) => {
                        if (response) {
                            const payload = { id: response.raw.insertId };
                            const accessToken = this.generateRandomToken();
                            this.userService.updateTokenByUserId(accessToken, response.raw.insertId);
                            this.userService.getUserDetailsByUserId(response.raw.insertId).then((data) => {
                                if (data) {
                                    data.accessToken = accessToken;
                                    data.photo = (data.photo !=="" && data.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + data.photo)  : process.env.USER_DEFAULT_IMAGE_PATH;
                                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully login", data: data });
                                }
                                else {
                                    res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                                }
                            });
                        }
                        else {
                            res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                        }
                    });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('login')
    login(@Body() user: User, @Res() res): boolean {
        try {        	
            if (!user.email) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter email id" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter password" });
                return false;
            }
            this.userService.login(user).then((response) => {
                if (response) {
                    if (response.status == 0) {
                        res.status(HttpStatus.OK).json({ success: false, message: "Please active your account" });
                    }
                    else {
                        const payload = { id: response.id };
                        response.accessToken = this.generateRandomToken();
                        response.photo = (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH;
                        this.userService.updateTokenByUserId(response.accessToken, response.id);
                        res.status(HttpStatus.OK).json({ success: true, message: "Successfully login", data: response });
                    }
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Invalid username. The username you have entered is not registered." });
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('activeUserAccount')
    activeUserAccount(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.id) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter id" });
                return false;
            }
            this.userService.updateStatusByUserId(user.id).then();
            this.userService.activeUserAccount(user.id).then((response) => {
                if (response) {
                    const payload = { id: response.id };
                    response.accessToken = this.generateRandomToken();
                    this.userService.updateTokenByUserId(response.accessToken, response.id);
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully get user details", data: response });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "User not found" });
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('updateProfileByUserId')
    updateProfileByUserId(@Body() user: any, @Res() res): boolean {
        try {
            if (!user.id) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter id" });
                return false;
            }
            if (!user.firstName) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter firstname" });
                return false;
            }
            if (!user.lastName) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter lastname" });
                return false;
            }
            const name = user.firstName + " " + user.lastName;
            const data = {name};
            this.userService.updateProfileByUserId(user.id,data).then((response) => {
                this.userService.getUserDetailsByUserId(user.id).then(response=>{
                    if(response){
                        let data = {
                            id:response.id,
                            name:response.name,
                            photo:(response.photo !== "" && response.photo !== undefined) ? (process.env.IMAGE_UPLOAD_PATH + response.photo) : process.env.HOTEL_DEFAULT_IMAGE_PATH
                        }
                        res.status(HttpStatus.OK).json({ success: true, message: "Successfully update profile",data:data });
                    }
                    else{
                        res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                    }
                });
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('checkEmailIdExist')
    checkEmailIdExist(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.email) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter email" });
                return false;
            }
            this.userService.checkEmailIdExist(user.email, user.id).then((data) => {
                if (data) {
                    res.status(HttpStatus.OK).json({ success: true, message: "Email id already exists" });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Email id does not exists" });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('forgotPassword')
    forgotPassword(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.email) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter email" });
                return false;
            }
            this.userService.forgotPassword(user.email).then((response) => {
                if (response) {
                    const button = `<a href="${process.env.BASE_PATH}changepassword/${response.id}" target="_blank">Change password</a>`;
                    this.sendMail(process.env.SUPPORT_EMAIL,user.email,'Successfully forgotpassword','Successfully forgotpassword',button);
                    res.status(HttpStatus.OK).json({ success: true, message: "Email you a link to reset your password." });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Email id not found" });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('getUserDetailsByUserId')
    getUserDetailsByUserId(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.id) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter id" });
                return false;
            }
            this.userService.getUserDetailsByUserId(user.id).then((response) => {
                if (response) {
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully get user details", data: response });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "User not found" });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }
   
    @Get('getUserDetails')
    @UseGuards(AuthGuard)
    getUserDetails(@Param("userLoginid") userLoginid:number, @Res() res) {
        try {
            this.userService.getUserDetailsByUserId(userLoginid).then((response) => {
                if (response) {
                    let data = {
                        name:response.name,
                        email:response.email,
                        age:response.age,
                        totalBookingNight:response.totalBookingNight,
                        description:(response.description &&  response.description!==null &&  response.description!==undefined) ? response.description : "",
                        photo: (response.photo !==null && response.photo !== undefined) ? (process.env.IMAGE_UPLOAD_PATH + response.photo) : process.env.USER_DEFAULT_IMAGE_PATH
                    }
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully get user details", data: data });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "User not found" });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('changePasswordByUserId')
    changePasswordByUserId(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.id) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter id" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter password" });
                return false;
            }
            this.userService.changePasswordByUserId(user).then((response) => {
                res.status(HttpStatus.OK).json({ success: true, message: "Successfully change password" });
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('signup')
    signup(@Body() user: any, @Res() res): boolean {
        try {
            if (!user.firstName) {
                res.status(HttpStatus.OK).json({ message: "Please enter first name" });
                return false;
            }
            if (!user.lastName) {
                res.status(HttpStatus.OK).json({ message: "Please enter last name" });
                return false;
            }
            if (!user.email) {
                res.status(HttpStatus.OK).json({ message: "Please enter email id" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ message: "Please enter password" });
                return false;
            }
            this.userService.checkEmailIdExist(user.email, user.id).then((data) => {
                if (!data) {
                    this.userService.checkAccountExist(user.email).then((data) => {
                        if (data) {
                            this.userService.updatePasswordById(data.id, user.password).then((response) => {
                                const button = `<a href="${process.env.BASE_PATH}dashboard/${data.id}" target="_blank">Active your account</a>`;
                                this.sendMail(process.env.SUPPORT_EMAIL,user.email,'Successfully registration','Successfully registration',button);
                                this.userService.getUserDetailsByUserId(data.id).then((response) => {
                                    if (response) {
                                        const token = this.generateJwtToken(response.id);
                                        const data = {
                                            "accessToken": token.accessToken,
                                            "refreshToken": token.refreshToken,
                                            "userInfo": {
                                                "userid":response.id,
                                                "name":response.name,
                                                "photo":(response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                                                "age":response.age,
                                                "description": (response.description == "" || response.description == null) ? "" : response.description,
                                                "isCommunity": response.isCommunity,
                                                "totalBookingNight": response.totalBookingNight,
                                                "isNewUser": true
                                            }
                                        };
                                        res.status(HttpStatus.OK).json(data);
                                    }
                                    else {
                                        res.status(HttpStatus.OK).json({ "message": "Something went wrong,Please try again later..." });
                                    }
                                });
                            });
                        }
                        else {
                            this.userService.signup(user).then((response) => {
                                if (response) {
                                    const button = `<a href="${process.env.BASE_PATH}dashboard/${response.raw.insertId}" target="_blank">Active your account</a>`;
                                    this.sendMail(process.env.SUPPORT_EMAIL,user.email,'Successfully registration','Successfully registration',button);
                                    this.userService.getUserDetailsByUserId(response.raw.insertId).then((response) => {
                                        if (response) {
                                            const token = this.generateJwtToken(response.id);
                                            const data = {
                                                "accessToken": token.accessToken,
                                                "refreshToken": token.refreshToken,
                                                "userInfo": {
                                                    "userid": response.id,
                                                    "name": response.name,
                                                    "photo": (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                                                    "age": response.age,
                                                    "description": (response.description == "" || response.description == null) ? "" : response.description,
                                                    "isCommunity": response.isCommunity,
                                                    "totalBookingNight": response.totalBookingNight,
                                                    "isNewUser": true
                                                }
                                            };
                                            res.status(HttpStatus.OK).json(data);
                                        }
                                        else {
                                            res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
                                        }
                                    });
                                }
                                else {
                                    res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(HttpStatus.OK).json({ message: "Email id already exist" });
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }


    @Post('signin')
    signin(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.email) {
                res.status(HttpStatus.OK).json({ message: "Please enter email id" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ message: "Please enter password" });
                return false;
            }
            this.userService.signin(user).then((response) => {
                if (response) {
                    if (response.status == 0) {
                        res.status(HttpStatus.OK).json({ message: "Please active your account" });
                    }
                    else {
                        const token = this.generateJwtToken(response.id);
                        const data = {
                            "accessToken": token.accessToken,
                            "refreshToken": token.refreshToken,
                            "userInfo": {
                                "userid": response.id,
                                "name": response.name,
                                "photo": (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                                "age": response.age,
                                "description": (response.description == "" || response.description == null) ? "" : response.description,
                                "isCommunity": response.isCommunity,
                                "totalBookingNight": response.totalBookingNight
                            }
                        };
                        res.status(HttpStatus.OK).json(data);
                    }
                }
                else {
                    res.status(HttpStatus.OK).json({ message: "Invalid username. The username you have entered is not registered." });
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Post('socialSignin')
    socialSignin(@Body() user: User, @Res() res): boolean {
        try {

            if (!user.name) {
                res.status(HttpStatus.OK).json({ message: "Please enter name" });
                return false;
            }
            if (!user.appId) {
                res.status(HttpStatus.OK).json({ message: "Please enter appId" });
                return false;
            }
            this.userService.socialLogin(user).then((response) => {
                if (response) {
                    const token = this.generateJwtToken(response.id);
                    const responseData = {
                        "accessToken": token.accessToken,
                        "refreshToken": token.refreshToken,
                        "userInfo": {
                            "userid": response.id,
                            "name": response.name,
                            "photo": (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                            "age": response.age,
                            "description": (response.description == "" || response.description == null) ? "" : response.description,
                            "isCommunity": response.isCommunity,
                            "totalBookingNight": response.totalBookingNight
                        }
                    };
                    res.status(HttpStatus.OK).json(responseData);
                }
                else {
                    this.userService.insertSocialLoginDetail(user).then((response) => {
                        if (response) {
                            this.userService.getUserDetailsByUserId(response.raw.insertId).then((response) => {
                                if (response) {
                                    const token = this.generateJwtToken(response.id);
                                    const responseData = {
                                        "accessToken": token.accessToken,
                                        "refreshToken": token.refreshToken,
                                        "userInfo": {
                                            "userid": response.id,
                                            "name": response.name,
                                            "photo": (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                                            "age": response.age,
                                            "description": (response.description == "" || response.description == null) ? "" : response.description,
                                            "isCommunity": response.isCommunity,
                                            "totalBookingNight": response.totalBookingNight
                                        }
                                    };
                                    res.status(HttpStatus.OK).json(responseData);
                                }
                                else {
                                    res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
                                }
                            });
                        }
                        else {
                            res.status(HttpStatus.OK).json({ message: "Something went wrong,Please try again later..." });
                        }
                    });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }



    @Post('getToken')
    getToken(@Body() request: any, @Res() res): boolean {
        try {
            if (!request.refreshToken) {
                res.status(HttpStatus.OK).json({ message: "Please enter refreshToken" });
                return false;
            }
            let refreshToken = request.refreshToken;
            if ((refreshToken) && (refreshToken in tokenList)) {
                const decode = JSON.parse(JSON.stringify(jwt.verify(refreshToken, config.refreshTokenSecret)));
                const response = this.generateJwtTokenByRefreshToken(decode.id, refreshToken);
                tokenList[refreshToken]["accessToken"] = response.accessToken;
                let data = {
                    "accessToken": response.accessToken,
                    "refreshToken": refreshToken
                };
                res.status(HttpStatus.OK).json(data);
            }
            else {
                res.status(HttpStatus.OK).json({ message: "Invalid refreshToken" });
            }
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }


    generateJwtToken(id: number): Jwtresponse {
        try {
            const payload = { id: id };
            const accessToken = jwt.sign(payload, config.secret, { expiresIn: config.tokenLife });
            const refreshToken = jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife });
            const tokenResponse = {
                "accessToken": accessToken,
                "refreshToken": refreshToken,
            };
            tokenList[refreshToken] = tokenResponse;
            return tokenResponse;
        }
        catch (error) {
            console.log(error);
        }
    }

    generateJwtTokenByRefreshToken(id: number, refreshToken: string): Jwtresponse {
        try {
            const payload = { id: id };
            const accessToken = jwt.sign(payload, config.secret, { expiresIn: config.tokenLife });
            const tokenResponse = {
                "accessToken": accessToken
            };
            return tokenResponse;
        }
        catch (error) {
            console.log(error);
        }
    }

    @Get('getTotalUser')
    getTotalUser(@Body() request: User, @Res() res): void {
        try {
            this.userService.getTotalUser().then((response) => {
                if (response) {
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully get total user", data: response });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Get('getUserList')
    getUserList(@Body() request: User, @Res() res): void {
        try {
            this.userService.getUserList().then((response) => {
                if (response) {
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully get user List", data: response });
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Something went wrong,Please try again later..." });
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('deleteUserById')
    deleteUserById(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.id) {
                res.status(HttpStatus.OK).json({ message: "Please enter id" });
                return false;
            }
            this.userService.deleteUserById(user.id).then((response) => {
                res.status(HttpStatus.OK).json({ success: true, message: "Successfully delete user" });
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }

    @Post('addNewUser')
    addNewUser(@Body() user: User, @Res() res): boolean {
        try {
            if (!user.name) {
                res.status(HttpStatus.OK).json({ message: "Please enter name" });
                return false;
            }
            if (!user.username) {
                res.status(HttpStatus.OK).json({ message: "Please enter username" });
                return false;
            }
            if (!user.email) {
                res.status(HttpStatus.OK).json({ message: "Please enter email" });
                return false;
            }
            if (!user.password) {
                res.status(HttpStatus.OK).json({ message: "Please enter password" });
                return false;
            }
            this.userService.addNewUser(user).then((response) => {
                res.status(HttpStatus.OK).json({ success: true, message: "Successfully add user" });
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong,Please try again later..." });
        }
    }
   /* END admin side api */

   @Get('getUserListByCityName')
    @UseGuards(JWTAuthGuard)
    getUserListByCityName(@Query("city") city: string,@Param("userLoginid") userLoginid:number, @Res() res) {
        try {
            let user = [];
            if (!city) {
                res.status(HttpStatus.OK).json({message: "Please enter city" });
                return false;
            }
            this.userService.getLastMessageByUserId(userLoginid, city).then((response) => {
                if (response) {                 
                    response.map(element => {
                        if(element.userId!=userLoginid) {
                            let data = {
                                userId: element.userId,
                                name: element.name,
                                photo: (response.photo !=="" && response.photo !==null)  ? (process.env.IMAGE_UPLOAD_PATH + response.photo)  : process.env.USER_DEFAULT_IMAGE_PATH,
                                lastmessage: (element.text != null) ? {
                                    date: (element.date == null || element.date == "") ? "" : new Date(element.date).toLocaleString(),
                                    text: (element.text == null || element.text == "") ? "" : element.text,
                                } :{}
                            };
                            user.push(data);
                        }
                    });
                    res.status(HttpStatus.OK).json(user);
                } else {
                    res.status(HttpStatus.OK).json(user);
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: error.message });
        }
    }

    @Post('sendRequest')
    @UseGuards(new JWTAuthGuard())
    sendRequest(@Body() userRequest: UserRequest, @Res() res,@Param("userLoginid") userLoginid:number) {
        try {
            if (!userRequest.toUserId) {
                res.status(HttpStatus.OK).json({message: "Please enter to user  id" });
                return false;
            }          
            this.userService.checkUserRequest(userLoginid,userRequest.toUserId).then((response) => {
                let data = {};
                if(!response){
                    this.userService.sendRequest(userLoginid,userRequest.toUserId).then();
                }
                data = { "isSendRequest": true };                    
                res.status(HttpStatus.OK).json(data); 
            });    
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Post('sendMessage')
    @UseGuards(JWTAuthGuard)
    sendMessage(@Body() message: Message, @Res() res,@Param("userLoginid") userLoginid:number) {
        try {
            if (!message.toUserId) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter to user id" });
                return false;
            }
            if (!message.message) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter message" });
                return false;
            }
            this.userService.sendMessage(userLoginid,message.toUserId,message.message).then((response) => {
                let data = { "isMessageSend": true };
                res.status(HttpStatus.OK).json(data);
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }

    @Post('getMessageListByUserId')
    @UseGuards(JWTAuthGuard)
    getMessageListByUserId(@Body('toUserId') toUserId: number,@Body('page') page: number, @Res() res,@Param("userLoginid") fromUserId:number) {
        try {
            if (!toUserId) {
                res.status(HttpStatus.OK).json({ message: "Please enter to user id" });
                return false;
            }
            if (!page) {
                res.status(HttpStatus.OK).json({ message: "Please enter page" });
                return false;
            }
            this.userService.getMessageListByUserId(fromUserId,toUserId,page).then((response) => {
                res.status(HttpStatus.OK).json({response});
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Post('getMessageList')
    @UseGuards(JWTAuthGuard)
    getMessageList(@Param("userLoginid") userLoginid:number,@Res() res) {
        try {          
            this.userService.getMessageList(userLoginid).then((response) => {
                res.status(HttpStatus.OK).json({response});
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Post('updateProfile')
    @UseGuards(JWTAuthGuard)
    updateProfile(@Body() user: User,@Param("userLoginid") userLoginid:number,@Res() res) {
        try {            
            if (!user.name) {
                res.status(HttpStatus.OK).json({ message: "Please enter name" });
                return false;
            }
            if (!user.email) {
                res.status(HttpStatus.OK).json({  message: "Please enter email" });
                return false;
            }
            this.userService.updateProfile(userLoginid,user.name,user.email).then((response) => {
                res.status(HttpStatus.OK).json({message:"Successfully update profile"});
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Post('updateprofilebyid')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image', {
		storage: diskStorage({
			destination: "./upload",
			filename: (req, file, cb) => {
				const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
				return cb(null, `${randomName}${extname(file.originalname)}`)
			}
		})
	}))	
    updateProfileById(@UploadedFile() images,@Body() user,@Param("userLoginid") userLoginid:number,@Res() res) {
        try {           
            if (!user.name) {
                res.status(HttpStatus.OK).json({ success:false,message: "Please enter name" });
                return false;
            }
            if (!user.age) {
                res.status(HttpStatus.OK).json({ success:false,message: "Please enter age" });
                return false;
            }
            if (!user.description) {
                res.status(HttpStatus.OK).json({ success:false,message: "Please enter description" });
                return false;
            }
            let data = (images !== undefined &&  images !== "") ? {name:user.name,age:user.age,photo:images.filename,description:user.description} : {name:user.name,age:user.age,description:user.description};
            this.userService.updateProfileByUserId(userLoginid,data).then(response=>{
                res.status(HttpStatus.OK).json({ success:true,message: "Successfully update"});
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @Get('customerSupport')
    customerSupport(@Res() res) {
        try {
            this.userService.customerSupport().then((response) => {
                if(response){
                    let data = {
                        "whatsApp":response.whatsApp,
                        "facebook":response.facebook,
                        "mobileNumber":response.mobileNumber,
                        "chat":response.chat,
                        "email":response.email
                    };
                    res.status(HttpStatus.OK).json({response:data});
                }
                else {
                    res.status(HttpStatus.OK).json({message:"Something went wrong,Please try again later..."});
                }
            });
        }
        catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }


    @Post('contactUs')
    contactUs(@Body("firstName") firstName:string,@Body("lastName") lastName:string,@Body("email") email:string,@Body("message") message:string,@Res() res) {
        try {
           	let data = `<table border='1'>
        					<tr>
        						<th>Name</th>
        						<th>${firstName} ${lastName}</th>
        					</tr>
        					<tr>
        						<th>Email</th>
        						<th>${email}</th>
        					</tr>
        					<tr>
        						<th>Message</th>
        						<th>${message}</th>
        					</tr>
        				</table>`;
            this.sendMail(process.env.SUPPORT_EMAIL,process.env.EMAIL,'Contact Us','Contact Us',data);
            res.status(HttpStatus.OK).json({ success: true, message: "Successfully send message"});        
 		}
        catch(error){
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}