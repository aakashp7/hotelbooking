import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    name:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    username:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    email:string; 

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    password:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci" })
    accessToken:string;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
