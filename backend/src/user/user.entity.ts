import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Users")
@Check("length(email) >= 5")
@Check("length(username) >= 3")
@Check("length(password) >= 5")
export class User {
    @PrimaryGeneratedColumn()
    id: string;

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
        type: "boolean",
        nullable: false,
        default: false
    })
    banned: boolean;

    @Column({
        type: "int",
        nullable: false,
        default: 0
    })
    timeout: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt: Date;
}