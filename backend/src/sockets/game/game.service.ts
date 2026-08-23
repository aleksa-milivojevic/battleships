import { Injectable } from "@nestjs/common";

@Injectable()
export class GameService {

    readonly fieldDim = 10;

    verifyField(field: number[][]): boolean {
        if (
            !this.has1Boats(field) ||
            !this.has2Boats(field) ||
            !this.has3Boats(field) ||
            !this.has4Boat(field)
        ) {
            return false;
        }
        return true;
    }

    has1Boats(field: number[][]): boolean {
        let count = 0;

        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j]) {
                    if (this.is1Boat(i, j, field)) count++;
                }
            }
        }

        return count === 4;
    }

    is1Boat(x: number, y: number, field: number[][]): boolean {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i < 0 || i > this.fieldDim || j < 0 || j > this.fieldDim) continue;
                if (field[i][j]) return false;
            }
        }
        return true;
    }

    has2Boats(_field: number[][]): boolean {
        let count = 0;
        const field = structuredClone(_field);
        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j]) {
                    if (this.is2Boat(i, j, field)) count++;
                }
            }
        }
        return count === 3;
    }

    is2Boat(x: number, y: number, field: number[][]): boolean {
        const { result, next } = this.isBoatEdge(x, y, field);
        if (result) {
            if (this.isBoatEdge(next.x, next.y, field).result) {
                field[next.x][next.y] = 0;
                return true;
            }
        }
        return false;
    }

    has3Boats(_field: number[][]): boolean {
        let count = 0;
        let field = structuredClone(_field);
        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j]) {
                    if (this.is3Boat(i, j, field)) count++;
                }
            }
        }
        return count === 2;
    }

    is3Boat(x: number, y: number, field: number[][]): boolean {
        let { result, next } = this.isBoatMiddle(x, y, field);
        if (result) {
            if (
                this.isBoatEdge(next[0].x, next[0].y, field).result &&
                this.isBoatEdge(next[1].x, next[1].y, field).result
            ) {
                field[next[0].x][next[0].y] = 0;
                field[next[1].x][next[1].y] = 0;
                return true;
            }
        }
        return false;
    }

    has4Boat(_field: number[][]): boolean {
        let count = 0;
        let field = structuredClone(_field);
        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j]) {
                    
                }
            }
        }
        return true;
    }

    is4Boat(x: number, y: number, field: number[][]) {
        const { result, next } = this.isBoatMiddle(x, y, field);
        if (result) {
            let v1 = this.isBoatEdge(next[0].x, next[0].y, field) && this.isBoatMiddle(next[1].x, next[1].y, field);
            let v2 = this.isBoatMiddle(next[0].x, next[0].y, field) && this.isBoatEdge(next[1].x, next[1].y, field);
            if (v1 || v2) {
                field[next[0].x][next[0].y] = 0;
                field[next[1].x][next[1].y] = 0;
                return true;
            }
        }
        return false;
    }

    isBoatEdge(x: number, y: number, field: number[][]): { result, next } {
        let counter = 0;
        let next = { x, y };
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i < 0 || i > this.fieldDim || j < 0 || j > this.fieldDim) continue;
                if (field[i][j]) {
                    counter++;
                    next.x = i;
                    next.y = j;
                }
            }
        }

        return { result: counter === 1, next };
    }

    isBoatMiddle(x: number, y: number, field: number[][]): { result, next } {
        let next: { x, y }[] = [];

        if (x < 0 || x > this.fieldDim || y < 0 || y > this.fieldDim) return { result: false, next };
        
        let numOfShipParts = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i < 0 || i > this.fieldDim || j < 0 || j > this.fieldDim) continue;
                if (field[i][j]) {
                    numOfShipParts++;
                    next.push({ x: i, y: j });
                }
            }
        }
        if (numOfShipParts !== 2) return { result: false, next };

        let v1 = (field[x-1][y] && field[x+1][y]);
        let v2 = (field[x][y-1] && field[x][y+1]);
        
        return { result: v1 || v2, next };
    }

    getAttackResult(coords: number[], field: number[][]): string {
        if (field[coords[0]][coords[1]]) {
            if (this.gameOver(field)) return 'game-end';
            return 'hit';
        }
        return 'miss';
    }

    gameOver(field): boolean {
        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j]) return false;
            }
        }
        return true;
    }
}