import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Like, Repository } from "typeorm";
import { ChangePasswordDto, ChangeUsernameDto, CreateUserDto, DeleteUserDto, FindAllParams, FindAllResponse, SingleUserResponse } from "./user.dto.params";
import * as bcrypt from "bcrypt";
import * as argon from "argon2";

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

    async findOneWithPassword(id: string): Promise<User> {
        const user = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.password')
                                .where('user.id = :id', { id })
                                .getOne();
        
        if (!user) {
            throw new NotFoundException('user not found');
        }


        return user;
    }

    async findOneWithToken(id: string): Promise<User> {
        const user = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.refreshToken')
                                .where('user.id = :id', { id })
                                .getOne();
        
        if (!user) {
            throw new NotFoundException('user not found');
        }


        return user;
    }

    async findOneByEmailWithPassword(email: string): Promise<User> {
        const user = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.password')
                                .where('user.email = :email', { email })
                                .getOne();
        
        if (!user) {
            throw new NotFoundException('user not found');
        }


        return user;
    }

    async findOneByEmail(email: string): Promise<SingleUserResponse> {
        const user = await this.userRepository.findOneBy({ email: email });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        return { user: user };
    }

    async checkExistingEmail(email: string): Promise<boolean> {
        return (await this.userRepository.findOneBy({ email: email })) !== null;
    }

    async checkExistingUsername(username: string): Promise<boolean> {
        return (await this.userRepository.findOneBy({ username: username })) !== null;
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
        let user = (await this.findOneWithPassword(changePassword.id));

        const matching = await bcrypt.compare(changePassword.password, user.password);

        if (!matching) {
            throw new UnauthorizedException('passwords not matching');
        }

        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

        const salt = await bcrypt.genSalt(saltRounds);

        var hashed = await bcrypt.hash(changePassword.newPassword, salt);

        await this.userRepository.update({ id: user.id }, { password: hashed });

        return { user: user };
    }

    async updateRefreshToken(id: string, token: string | null) {
        if (token) {
            const hashed = await argon.hash(token);
            return await this.userRepository.update({ id: id }, { refreshToken: hashed });
        }
        else {
            return await this.userRepository.update({ id: id }, { refreshToken: token });
        }
    }

    async deleteOne(deleteDto: DeleteUserDto) {
        const user = await this.findOneWithPassword(deleteDto.id);

        const matching = await bcrypt.compare(deleteDto.password, user.password);

        if (!matching) {
            throw new BadRequestException("password is incorrect");
        }

        const result = await this.userRepository.delete({ id: user.id });

        if (result.affected === 1) {
            return { message: 'Deletion succesfull' };
        }

        throw new InternalServerErrorException(`Server error, rows affected: ${result.affected}`);
    }
}