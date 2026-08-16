import { IsNumber, IsNumberString, IsString } from "class-validator";
import { Match } from "./match.entity";

export class FindAllParams {
    @IsNumber()
    round: number;

    @IsNumber()
    count: number;
}

export class FindAllResponse {
    matches: Match[];
    more: boolean;
}

export class AddOneDto {
    @IsNumberString()
    readonly winner: string;

    @IsNumberString()
    readonly looser: string;

    @IsNumber()
    readonly points: number;
}