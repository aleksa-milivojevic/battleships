import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Matches")
export class Match {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'winner' })
    winner: User;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'looser' })
    looser: User;

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