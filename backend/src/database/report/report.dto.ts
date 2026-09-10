import { IsNumber, IsNumberString, IsString } from "class-validator";
import { Report } from "./report.entity";
import { User } from "../user/user.entity";

export class FindAllParams {
    @IsNumber()
    round: number;

    @IsNumber()
    count: number;
}

export class FindAllResponse {
    reports: Report[];
    more: boolean;
}

export class AddOneDto {
    @IsNumberString()
    reported: string;

    @IsNumberString()
    source: string;

    @IsString()
    type: string;

    @IsString()
    messages: string;
}

export class ReportedUser {
    user: User;
    reports: Report[];
}

export class ReportedUsersResponse {
    users: ReportedUser[];
    more: boolean;
}