import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HotelBooking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int",default:0 })
    userId:number; 
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    transactionId:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    reservationId:string;
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    hotelCode:number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    hotelName:number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    address:number;
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    hotelImage:number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    phone:number;

    @Column({ type: "date",default:null,collation:"utf8_unicode_ci" })
    checkInDate:Date;

    @Column({ type: "date",default:null,collation:"utf8_unicode_ci" })
    checkOutDate:Date;

    @Column({type: "int",default:0 })
    adults:number;
    
    @Column({type: "int",default:0 })
    rooms:number;
    
    @Column({type: "int",default:0 })
    children:number;

    @Column({type: "decimal",precision: 10, scale: 2, default: 0 })
    amount:number;

    @Column({ type: "tinyint",width:1,default: 0,comment:'1-Sage Payment,2-Paypal Payment' })
    paymentType:number;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string; 
}
