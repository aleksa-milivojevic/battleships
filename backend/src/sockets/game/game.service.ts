import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ILike } from "typeorm";

@Injectable()
export class GameService {

    readonly fieldDim = 10;

    is1Boat(x: number, y: number, field: number[][], visited: boolean[][]): boolean {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim || ny < 0 || ny >= this.fieldDim) continue;
                visited[nx][ny] = true;
                if (i === 0 && j === 0) continue;
                if (field[nx][ny]) return false;
            }
        }
        return true;
    }

    is2Boat(x: number, y: number, field: number[][], visited: boolean[][]): boolean {
        const { result, next } = this.isBoatEdge(x, y, field, visited);
        if (result) {
            if (this.isBoatEdge(next.x, next.y, field, visited).result) return true;
        }
        return false;
    }

    is3Boat(x: number, y: number, field: number[][], visited: boolean[][]): boolean {
        let { result: result1, next: next1 } = this.isBoatMiddle(x, y, field, visited);
        if (result1) {
            if (
                this.isBoatEdge(next1[0].x, next1[0].y, field, visited).result &&
                this.isBoatEdge(next1[1].x, next1[1].y, field, visited).result
            )
            return true;
        }
        let { result: result2, next: next2 } = this.isBoatEdge(x, y, field, visited);
        if (result2) {
            let { result, next } = this.isBoatMiddle(next2.x, next2.y, field, visited);
            if (result &&
                this.isBoatEdge(next[0].x, next[0].y, field, visited).result &&
                this.isBoatEdge(next[1].x, next[1].y, field, visited).result
            )
            return true;
        }
        return false;
    }

    is4Boat(x: number, y: number, field: number[][], visited: boolean[][]) {
        let { result, next } = this.isBoatEdge(x, y, field, visited);
        if (result) {
            if (this.is4BoatFromMiddle(next.x, next.y, field, visited)) return true;
        }
        return this.is4BoatFromMiddle(x, y, field, visited);
    }

    is4BoatFromMiddle(x: number, y: number, field: number[][], visited: boolean[][]) {
        const { result, next } = this.isBoatMiddle(x, y, field, visited);
        if (result) {
            let v1 = this.isBoatEdge(next[0].x, next[0].y, field, visited).result && this.isBoatMiddle(next[1].x, next[1].y, field, visited).result;
            let v2 = this.isBoatMiddle(next[0].x, next[0].y, field, visited).result && this.isBoatEdge(next[1].x, next[1].y, field, visited).result;
            if (v1) {
                let { result: res, next: nx } = this.isBoatMiddle(next[1].x, next[1].y, field, visited);
                if (
                    (this.isBoatEdge(nx[0].x, nx[0].y, field, visited).result && this.isBoatMiddle(nx[1].x, nx[1].y, field, visited).result) ||
                    (this.isBoatMiddle(nx[0].x, nx[0].y, field, visited).result && this.isBoatEdge(nx[1].x, nx[1].y, field, visited).result)
                ) return true;
            }
            if (v2) {
                let { result: res, next: nx } = this.isBoatMiddle(next[0].x, next[0].y, field, visited);
                if (
                    (this.isBoatEdge(nx[0].x, nx[0].y, field, visited).result && this.isBoatMiddle(nx[1].x, nx[1].y, field, visited).result) ||
                    (this.isBoatMiddle(nx[0].x, nx[0].y, field, visited).result && this.isBoatEdge(nx[1].x, nx[1].y, field, visited).result)
                ) return true;
            }
        }
        return false;
    }

    verify(field: number[][]): boolean {
        const visited = Array.from(
            { length: this.fieldDim },
            () => Array(this.fieldDim).fill(false)
        );
        
        const ships: number[] = [];
        
        for (let i = 0; i < this.fieldDim; i++) {
            for (let j = 0; j < this.fieldDim; j++) {
                if (field[i][j] && !visited[i][j]) {
                    const size = this.getShip(i, j, field, visited);
                    ships.push(size);
                }
            }
        }

        ships.sort((a, b) => a - b);

        return JSON.stringify(ships) === JSON.stringify([1, 1, 1, 1, 2, 2, 2, 3, 3, 4]);
    }

    getShip(x: number, y: number, field: number[][], visited: boolean[][]): number {
        if (this.is1Boat(x,y,field, visited)) return 1;
        else if (this.is2Boat(x,y,field, visited)) return 2;
        else if (this.is3Boat(x,y,field, visited)) return 3;
        else if (this.is4Boat(x,y,field, visited)) return 4;
        throw new WsException('Field is not valid');
    }

    isBoatEdge(x: number, y: number, field: number[][], visited: boolean[][]): { result, next } {
        let counter = 0;
        let next = { x, y };
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim || ny < 0 || ny >= this.fieldDim) continue;
                visited[nx][ny] = true;
                if (i === 0 && j === 0) continue;
                if (field[nx][ny]) {
                    counter++;
                    next.x = nx;
                    next.y = ny;
                }
            }
        }

        return { result: counter === 1, next };
    }

    isBoatMiddle(x: number, y: number, field: number[][], visited: boolean[][]): { result, next } {
        let next: { x, y }[] = [];

        if (x < 0 || x >= this.fieldDim || y < 0 || y >= this.fieldDim) return { result: false, next };
        
        let numOfShipParts = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim || ny < 0 || ny >= this.fieldDim) continue;
                visited[nx][ny] = true;
                if (i === 0 && j === 0) continue;
                if (field[nx][ny]) {
                    numOfShipParts++;
                    next.push({ x: nx, y: ny });
                }
            }
        }
        if (numOfShipParts !== 2) return { result: false, next };

        let v1 = (x > 0 && x < this.fieldDim - 1) && (field[x-1][y] && field[x+1][y]);
        let v2 = (y > 0 && y < this.fieldDim - 1) && (field[x][y-1] && field[x][y+1]);
        
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