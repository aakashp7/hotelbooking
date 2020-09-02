import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CustomerSupport {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    whatsApp:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    facebook:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    mobileNumber:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    chat:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    email:string;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
