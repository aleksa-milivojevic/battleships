import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    findOne(id: string): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email: email });
    }

    addOne(userDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(userDto);

        return this.userRepository.save(user);
    }

    async removeOne(id: string): Promise<void> {
        await this.userRepository.delete({ id });
    }
}