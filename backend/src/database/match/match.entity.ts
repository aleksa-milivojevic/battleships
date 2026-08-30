import { User } from "src/database/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Matches")
export class Match {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'winner' })
    winner: User | null;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'looser' })
    looser: User | null;

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