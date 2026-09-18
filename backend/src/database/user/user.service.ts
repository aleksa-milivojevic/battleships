import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { In, IsNull, LessThan, Like, Not, Repository } from "typeorm";
import { ChangePasswordDto, ChangeUsernameDto, CreateUserDto, DeleteUserDto, FindAllParams, FindAllResponse, FindRestrictedParams, FindRestrictedResponse, LeaderboardParams, MultipleUserResponse, PictureDto, SingleUserResponse } from "./user.dto.params";
import * as bcrypt from "bcrypt";
import * as argon from "argon2";
import { NestCloudinaryService } from "src/cloudinary/cloudinary.service";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private cloudinaryService: NestCloudinaryService
        // private reportService: ReportService
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
        await this.cloudinaryService.delete(id);
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

    async ban(adminId: string, targetId: string) {
        const admin = (await this.findOne(adminId)).user;
        if (!admin.admin) {
            console.log('user not an admin');
            throw new UnauthorizedException('You have no admin priviledges');
        }

        const result = await this.userRepository.update({ id: targetId }, { banned: true, timeout: 0 });
        console.log('rows affected: ', result.affected);
        if (result.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${result.affected}`);
        }

        //  await this.reportService.removeOnes(targetId);
    }

    async unban(adminId: string, targetId: string) {
        const admin = (await this.findOne(adminId)).user;
        if (!admin.admin) {
            throw new UnauthorizedException('You have no admin priviledges');
        }

        const result = await this.userRepository.update({ id: targetId }, { banned: false });
        if (result.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${result.affected}`);
        }
    }

    async timeout(adminId: string, targetId: string, duration: number) {
        const admin = (await this.findOne(adminId)).user;
        if (!admin.admin) {
            throw new UnauthorizedException('You have no admin priviledges');
        }

        const target = (await this.findOne(targetId)).user;
        if (!target) {
            throw new BadRequestException('targeted user not found');
        }
        if (target.banned) {
            throw new BadRequestException('targeted user is already permanently banned');
        }

        let date = new Date();
        date.setHours(date.getHours() + duration * 24);

        const result = await this.userRepository.update({ id: targetId }, { timeout: date });
        if (result.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${result.affected}`);
        }

        // await this.reportService.removeOnes(targetId);
    }

    async untimeout(adminId: string, targetId: string) {
        const admin = (await this.findOne(adminId)).user;
        if (!admin.admin) {
            throw new UnauthorizedException('You have no admin priviledges');
        }

        const result = await this.userRepository.update({ id: targetId }, { timeout: null });
        if (result.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected: ${result.affected}`);
        }
    }

    async expire(targetId: string) {
        const result = await this.userRepository.update({ id: targetId }, { timeout: null });
        if (result.affected !== 1) {
            throw new InternalServerErrorException(`Timeout expired error. Rows affected: ${result.affected}`);
        }
    }

    async checkExpiredTimeouts() {
        const list = await this.userRepository.find({
            where: {
                timeout: LessThan(new Date())
            }
        });

        if (!list || list.length === 0) return;

        const result = await this.userRepository.update(
            { id: In(list.map(user => user.id))},
            { timeout: null }
        );

        if (result.affected !== list.length) {
            throw new InternalServerErrorException(`Checking expired timeouts error. Affected ${result.affected} rows, but found ${list.length} expired timeouts`);
        }
    }

    async findRestricted(params: FindRestrictedParams): Promise<FindRestrictedResponse> {
        let users = await this.userRepository.find({
            where: [
                { banned: true },
                { timeout: Not(IsNull()) }
            ]
        })

        if (!users) throw new NotFoundException('no restricted users');

        users = users.slice((params.round-1)*params.count, params.round*params.count);

        return {
            users: users,
            more: users.length === params.count
        }
    }

    async updatePicture(picture: Express.Multer.File, id: string): Promise<{ url: string }> {
        if (!id) throw new BadRequestException(`id: ${id}`);
        
        let user = await this.findOne(id);

        const result = await this.cloudinaryService.upload(picture, {
                public_id: `profile_${id}`,
                folder: `battleships`,
                upload_preset: 'battleship_preset',
                overwrite: true,
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face', fetch_format: 'auto', quiality: 'auto' }
                ]
            }
        )

        if (!result) {
            throw new InternalServerErrorException('cloudinary upload failed');
        }

        const res = await this.userRepository.update(
            { id: id },
            { picture: result.secure_url }
        )

        if (res.affected !== 1) {
            throw new InternalServerErrorException(`Rows affected while updating picture: ${res.affected}`);
        }

        return { url: result.secure_url };
    }
}