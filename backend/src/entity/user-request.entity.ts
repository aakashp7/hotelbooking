import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserRequest {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int" })
    fromUserId:number;

    @Column({type: "int"})
    toUserId:number;

    @Column({type: "tinyint",width: 1,default:0,comment:'0-Send request,1-Accept,2-Decline' })
    isAccepted:string; 

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
