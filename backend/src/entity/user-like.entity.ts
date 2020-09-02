import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLike {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int" })
    userId:number;

    @Column({type: "int",default:0})
    hotelCode:number;

    @Column({type: "int",default:0})
    commentId:number;

    @Column({type: "tinyint",width: 1,default:0,comment:'0-dislike,1-like' })
    isLike:number; 

    @Column({ type: "tinyint",width:1,default: 1,comment:'0-Deactive,1-Active,2-Delete' })
    status:number;

    @Column({ type: 'timestamp', name: 'createdAt', default: () => 'LOCALTIMESTAMP' })
    createdAt: string;

    @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'LOCALTIMESTAMP' })
    updatedAt: string;  
}
