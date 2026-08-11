import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Like, Repository } from "typeorm";
import { ChangeUsernameDto, CreateUserDto, FindAllParams, FindAllResponse, SingleUserResponse } from "./user.dto.params";
import { NotFoundError } from "rxjs";

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

    async findOne(id: string): Promise<SingleUserResponse> {
        const user = await this.userRepository.findOneBy({ id });
        
        if (!user) {
            throw new NotFoundException('user not found');
        }

        return { user: user };
    }

    async findOneByEmail(email: string): Promise<SingleUserResponse> {
        const user = await this.userRepository.findOneBy({ email: email });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        return { user: user };
    }

    async addOne(userDto: CreateUserDto): Promise<SingleUserResponse> {
        const user = this.userRepository.create(userDto);

        await this.userRepository.save(user);

        return { user: user };
    }

    async removeOne(id: string): Promise<void> {
        await this.userRepository.delete({ id });
    }

    
    async changeUsername(changeUsername: ChangeUsernameDto): Promise<SingleUserResponse> {
        const user = await this.userRepository.findOneBy({ id: changeUsername.id });
        if (!user) {
            throw new NotFoundException('user not found');
        }
        user.username = changeUsername.username;
        
        await this.userRepository.save(user);

        return { user: user };
    }
}