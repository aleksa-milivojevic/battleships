import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Matches")
export class Match {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        type: "int"
    })
    @ManyToOne(() => User)
    winner: number;

    @Column({
        type: "int"
    })
    @ManyToOne(() => User)
    looser: number;

    @Column({
        type: "int",
        unsigned: true,
        nullable: false,
        default: 150
    })
    points: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date;
}