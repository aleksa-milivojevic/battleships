import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { In, Like, Not, Repository } from "typeorm";
import { ChangePasswordDto, ChangeUsernameDto, CreateUserDto, DeleteUserDto, FindAllParams, FindAllResponse, LeaderboardParams, MultipleUserResponse, SingleUserResponse } from "./user.dto.params";
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
                username: Like(`%${params.search}%`),
                id: Not(params.id)
            }
        });

        users = users.slice((params.round-1)*params.count, params.round*params.count);

        return {
            users: users,
            more: users.length === params.count
        }
    }

    async getLeaderboard(params: LeaderboardParams): Promise<FindAllResponse> {
        let users = await this.userRepository.find({
            order: {
                score: 'DESC'
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

    async setOnline(id: string) {
        const res = await this.userRepository.update({ id: id }, { online: true });
        console.log(res.raw);
        if (res.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${res.affected}`);
        }
    }

    async setOffline(id: string) {
        const res = await this.userRepository.update({ id: id }, { online: false });

        if (res.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${res.affected}`);
        }
    }

    async findList(ids: number[]): Promise<MultipleUserResponse> {
        const users = await this.userRepository.find({
            where:{
                id: In(ids)
            }
        });

        if (!users) {
            throw new BadRequestException('no users found for given ids');
        }

        return {
            users: users
        }
    }

    async updateScores(wId: string, lId: string, points: number) {
        const looser = (await this.findOne(lId)).user;
        
        if (looser.score <= points)
            await this.userRepository.update({ id: lId }, { score: 0 });
        else 
            await this.userRepository.decrement({ id: lId }, 'score', points);
        
        await this.userRepository.increment({ id: wId }, 'score', points);    
    }
}