import { User } from "src/database/user/user.entity";
import { text } from "stream/consumers";
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Reports")
@Check("'type' IN ('messages', 'cheating')")
export class Report {
    @PrimaryGeneratedColumn()
    id: string;

    
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reported' })
    reported: User;

    
    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'source' })
    source: User | null;

    @Column({
        type: "varchar",
        length: 10,
        nullable: false
    })
    type: string;

    @Column({
        type: "text"
    })
    messages: string;
}