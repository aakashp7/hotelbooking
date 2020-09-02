import { Controller, Post, Body, Res,HttpStatus } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/entity/admin.entity';

@Controller('api')
export class AdminController {
    constructor(
        private adminService: AdminService,
    ) {}

    @Post('adminLogin')
    adminLogin(@Body() admin: Admin, @Res() res): boolean {
        try {
            if (!admin.email) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter email id" });
                return false;
            }
            if (!admin.password) {
                res.status(HttpStatus.OK).json({ success: false, message: "Please enter password" });
                return false;
            }
            this.adminService.login(admin).then((response) => {
                if (response) {
                    const payload = { id: response.id };
                    response.accessToken = "";
                    this.adminService.updateTokenByUserId(response.accessToken, response.id);
                    res.status(HttpStatus.OK).json({ success: true, message: "Successfully login", data: response });                    
                }
                else {
                    res.status(HttpStatus.OK).json({ success: false, message: "Invalid username and password" });
                }
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
}
