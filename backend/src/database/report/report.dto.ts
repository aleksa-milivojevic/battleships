import { IsNumber, IsNumberString, IsString } from "class-validator";
import { Report } from "./report.entity";

export class FindAllParams {
    @IsNumber()
    round: number;

    @IsNumber()
    count: number;

    @IsNumberString()
    user: string;
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