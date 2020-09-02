import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    name:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    username:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    email:string;

    @Column({ length: 255,default:null,comment:'Facebook,Google',collation:"utf8_unicode_ci" })
    appId:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    photo:string;

    @Column({ default:0 })
    age:number;

    @Column({ type: "tinyint",width:1,default: 0,comment:'0-Default,1-Facebook,2-Google' })
    type:number;

    @Column({type: "text",default:null,collation:"utf8_unicode_ci"  })    
    description:string;

    @Column({ default:false })    
    isCommunity:boolean;

    @Column({ default:0 })    
    totalBookingNight:number;  

    @Column({type: "text",default:null,collation:"utf8_unicode_ci"  }) 
    socketId:string;

    @Column({ type: "tinyint",width:1,default: 0,comment:'0-Deactive,1-Active' })
    userActive:number;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci" })
    password:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    accessToken:string;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;    
}