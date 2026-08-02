import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 254,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type: "varchar",
        length: 20,
        nullable: false,
        unique: true
    })
    username: string;

    @Column({
        type: "varchar",
        length: 254,
        nullable: false
    })
    password: string;

    @Column({
        type: "int",
        unsigned: true,
        nullable: false,
        default: 0
    })
    score: number;

    @Column({
        type: "boolean",
        nullable: false,
        default: false
    })
    admin: boolean;

    @Column({
        type: "boolean",
        nullable: false,
        default: false
    })
    online: boolean;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date;
}