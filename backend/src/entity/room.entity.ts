import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int" })
    hotelId:number;

  
 
    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    roomTypeCode:string; 

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    ratePlanCode:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    roomDescription:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    availabilityStatus:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    amountAfterTax:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    nonRefundable:string;    

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    totalRateIncTax:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    currency:string;


    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    tokenCode:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    tokenName:string;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    roomToken:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    noOfNights:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    cancellationStartDate:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    cancellationEndDate:string;

    @Column({ length: 255,default:null,collation:"utf8_unicode_ci"  })
    cancellationAmount:string;

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string; 

}
