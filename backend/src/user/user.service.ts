import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Like, Repository } from "typeorm";
import { ChangePasswordDto, ChangeUsernameDto, CreateUserDto, FindAllParams, FindAllResponse, SingleUserResponse } from "./user.dto.params";
import { NotFoundError } from "rxjs";
import * as bcrypt from "bcrypt";

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

    async checkExisting(email: string): Promise<boolean> {
        return (await this.userRepository.findOneBy({ email: email })) !== null;
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

    async changePassword(changePassword: ChangePasswordDto): Promise<SingleUserResponse> {
        let user = await this.userRepository.findOneBy({ id: changePassword.id })

        if (!user) {
            throw new NotFoundException('user not found');
        }

        const matching = await bcrypt.compare(changePassword.password, user.password);

        if (!matching) {
            throw new UnauthorizedException('passwords not matching');
        }

        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

        const salt = await bcrypt.genSalt(saltRounds);

        var hashed = await bcrypt.hash(changePassword.newPassword, salt);

        user.password = hashed;

        await this.userRepository.save(user);

        return { user: user };
    }
}