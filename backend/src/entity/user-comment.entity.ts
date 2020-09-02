import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserComment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int" })
    userId:number;

    @Column({type: "int"})
    hotelCode:number;

    @Column({type: "text",default:null})
    comment:string; 

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
