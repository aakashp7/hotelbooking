import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int" })
    fromUserId:number;

    @Column({type: "int"})
    toUserId:number;

    @Column({ type: "text",default:null,collation:"utf8_unicode_ci" })
    message:string;
    
    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
