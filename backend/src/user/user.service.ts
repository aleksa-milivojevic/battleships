import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Like, Repository } from "typeorm";
import { CreateUserDto, FindAllParams, FindAllResponse } from "./user.dto.params";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async findAll(params: FindAllParams): Promise<FindAllResponse> {
        let users = await this.userRepository.find({
            where: {
                username: Like(`%${params.search}%`)
            }
        });

        users = users.slice((params.round-1)*params.count, params.round*params.count);

        return {
            users: users,
            more: users.length === params.count
        }
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