import { User } from "src/user/user.entity";
import { text } from "stream/consumers";
import { Check, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Check("'type' IN ('messages', 'cheating')")
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
        nullable: false,
    })
    @ManyToOne(() => User)
    reported: number;

    @Column({
        type: "int",
        nullable: false,
    })
    @ManyToOne(() => User)
    source: number;

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