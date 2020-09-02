import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hotel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    country:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    state:string;    

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    city:string;    

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    postalcode:string;
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    address:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    longitude:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    latitude:string;
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    email:string; 
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    image:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    tokenName:string;
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    tokenCode:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    categoryCode:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    categoryUngroupedCode:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    categoryName:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    hotelName:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    type:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    phone:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    fax:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    attribute:string;  
    
    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    url:string;    

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    cadhot:string;    

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    countryId:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    provinceId:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    townId:string;  

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    hotelCode:string;    

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string; 
}
