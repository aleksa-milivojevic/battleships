import { User } from "src/database/user/user.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Queue")
export class Queue {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        type: "int",
        nullable: false,
    })
    @OneToOne(() => User)
    user: number;
}