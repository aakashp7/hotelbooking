import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Country
 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    countryId:string;
    
    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    countryName:string;
    
    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    provinceId:string;
    
    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    provinceName:string;

    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    townId:string;  

    @Column({type: "text",default:null,collation:"utf8_unicode_ci" })
    townName:string;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
