import { Module,HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from 'src/entity/hotel.entity';
import { HotelBooking } from 'src/entity/hotel-booking.entity';
import { UserLike } from 'src/entity/user-like.entity';
import { User } from 'src/entity/user.entity';
import { Country } from 'src/entity/country.entity';
import { UserComment } from 'src/entity/user-comment.entity';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';



@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Hotel,User,UserLike,UserComment,Country,HotelBooking])
  ],
  providers: [HotelService],
  controllers: [HotelController]
})
export class HotelModule {}
