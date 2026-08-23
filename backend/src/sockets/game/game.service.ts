import { Injectable } from "@nestjs/common";

@Injectable()
export class GameService {

    readonly fieldDim = 10;

    verifyField(field: number[][]): boolean {
        return true;
    }

    getAttackResult(coords: number[], field: number[][]): string {
        return '';
    }
}