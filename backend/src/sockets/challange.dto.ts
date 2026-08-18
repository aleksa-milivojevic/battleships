import { IsNumberString } from "class-validator";

export class ChallangeDto {
    @IsNumberString()
    target: string;

    @IsNumberString()
    source: string;
}