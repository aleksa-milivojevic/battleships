import { Injectable, effect, inject, signal } from "@angular/core";
import { StorageService } from "./storage.service";

interface Coords {
    x: number,
    y: number
}

@Injectable({
    providedIn: 'root'
})
export class BotService {
    private storage = inject(StorageService);

    private readonly fieldDim = 9;

    // 1 ship, 0 sea, -1 sink
    private _field = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));
    readonly field = this._field.asReadonly();

    private _oppField = signal<number[][]>([]);

    private nextMove = signal<{ x: number, y: number, axis: number }[]>([]);

    constructor() {
        effect(() => {
            this._field();
            this.storage.setItem('BOT_FIELD', this._field());
        });
        effect(() => {
            this._oppField();
            this.storage.setItem('BOT_OPP_FIELD', this._oppField());
        });
        effect(() => {
            this.nextMove;
            this.storage.setItem('MOVES', this.nextMove);
        });
    }

    setOppField(oppField: number[][]): boolean {
        if (!this.validateField(oppField)) return false;
        this._oppField.set(oppField);
        this._field.set(Array.from({ length: 10 }, () => Array(10).fill(0)));
        this.createField();
        return true;
    }

    createField() {
        let taken = Array.from({ length: 10 }, () => Array(10).fill(false));
        this.create4Boat(taken);
        this.create3Boats(taken);
        this.create2Boats(taken);
        this.create1Boats(taken);
    }

    takeUp(x: number, y: number, taken: boolean[][]) {
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (
                    nx >= 0 && nx <= this.fieldDim &&
                    ny >= 0 && ny <= this.fieldDim
                ) {
                    taken[nx][ny] = true;
                }
            }
    }

    isTaken(x: number, y: number, taken: boolean[][]) {
        if (
            x < 0 || x > this.fieldDim ||
            y < 0 || y > this.fieldDim
        ) {
            return true;
        }
        return taken[x][y];
    }

    create4Boat(taken: boolean[][]) {
        console.log(this._field());
        const toSet = 3;
        let x = Math.floor(Math.random() * 10);
        let y = Math.floor(Math.random() * 10);
        let vh = Math.floor(Math.random() * 2);
        let dir = Math.floor(Math.random() * 2);

        this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; return f; });
        this.takeUp(x, y, taken);
        if (vh) {
            let bottom, top;
            if (dir) {
                bottom = (this.fieldDim - x < toSet) ? this.fieldDim - x : toSet;
                top = toSet - bottom;
            }
            else {
                top = (x < toSet) ? x : toSet;
                bottom = toSet - top;
            }
            for (let i = 1; i <= bottom; i++) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x+i][y] = 1; return f; });
                this.takeUp(x+i, y, taken);
            }
            for (let i = 1; i <= top; i++) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x-i][y] = 1; return f; });
                this.takeUp(x-i, y, taken);
            }
        }
        else {
            let left, right;
            if (dir) {
                right = (this.fieldDim - y < toSet) ? this.fieldDim - y : toSet;
                left = toSet - right;
            }
            else {
                left = (y < toSet) ? y : toSet;
                right = toSet - left;
            }
            for (let i = 1; i <= right; i++) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y+i] = 1; return f; });
                this.takeUp(x, y+i, taken);
            }
            for (let i = 1; i <= left; i++) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y-i] = 1; return f; });
                this.takeUp(x, y-i, taken);
            }
        }
    }

    create3Boats(taken: boolean[][]) {
        let success = 0;
        while (success < 2) {
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);

            let bot1 = this.isTaken(x+1, y, taken), bot2 = this.isTaken(x+2, y, taken);
            let top1 = this.isTaken(x-1, y, taken), top2 = this.isTaken(x-2, y, taken);
            
            if (!bot1 && !bot2) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x+1][y] = 1; f[x+2][y] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x+1, y, taken); this.takeUp(x+2, y, taken);
                success++;
                continue;
            }
            else if (!bot1 && bot2 && !top1) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x+1][y] = 1; f[x-1][y] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x+1, y, taken); this.takeUp(x-1, y, taken);
                success++;
                continue;
            }
            else if (!top1 && !top2) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x-1][y] = 1; f[x-2][y] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x-1, y, taken); this.takeUp(x-2, y, taken);
                success++;
                continue;
            }

            let right1 = this.isTaken(x, y+1, taken), right2 = this.isTaken(x, y+2, taken);
            let left1 = this.isTaken(x, y-1, taken), left2 = this.isTaken(x, y-2, taken);

            if (!right1 && !right2) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x][y+1] = 1; f[x][y+2] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x, y+1, taken); this.takeUp(x, y+2, taken);
                success++;
                continue;
            }
            else if (!right1 && right2 && !left1) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x][y+1] = 1; f[x][y-1] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x, y+1, taken); this.takeUp(x, y-1, taken);
                success++;
                continue;
            }
            else if (!left1 && !left2) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x][y-1] = 1; f[x][y-2] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x, y-1, taken); this.takeUp(x, y-2, taken);
                success++;
                continue;
            }
        }
    }

    create2Boats(taken: boolean[][]) {
        let success = 0;
        while (success < 3) {
            let free = [];
            for (let i = 0; i <= this.fieldDim; i++)
                for (let j = 0; j <= this.fieldDim; j++)
                    if (!taken[i][j]) free.push({ x: i, y: j });

            let index = Math.floor(Math.random() * free.length);
            let x = free[index].x;
            let y = free[index].y;
            let top = this.isTaken(x-1, y, taken);
            let bot = this.isTaken(x+1, y, taken);
            let left = this.isTaken(x, y-1, taken);
            let right = this.isTaken(x, y+1, taken);
            if (!top) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x-1][y] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x-1, y, taken);
                success++;
                continue;
            }
            else if (!bot) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x+1][y] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x+1, y, taken);
                success++;
                continue;
            }
            else if (!left) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x][y-1] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x, y-1, taken);
                success++;
                continue;
            }
            else if (!right) {
                this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; f[x][y+1] = 1; return f });
                this.takeUp(x, y, taken); this.takeUp(x, y+1, taken);
                success++;
                continue;
            }
        }
    }

    create1Boats(taken: boolean[][]) {
        let success = 0;
        while (success < 4) {
            let free = [];
            for (let i = 0; i <= this.fieldDim; i++)
                for (let j = 0; j <= this.fieldDim; j++)
                    if (!taken[i][j]) free.push({ x: i, y: j });

            let index = Math.floor(Math.random() * free.length);
            let x = free[index].x;
            let y = free[index].y;
            this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = 1; return f });
            this.takeUp(x, y, taken);
            success++;
            continue;
        }
    }

    regiterAttack(x: number, y: number): string {
        if (this._field()[x][y] === 1) {
            this._field.update(field => {let f = field.map(row => [...row]); f[x][y] = -1; return f });
            if (this.gameOver(this._field())) return 'game-end';
            return 'hit'
        }
        return 'miss';
    }

    attack(): {result: string, coords: Coords} {
        if (this.nextMove().length === 0) {
            let free = []
            for (let i = 0; i <= this.fieldDim; i++)
                for (let j = 0; j <= this.fieldDim; j++)
                    if (this._oppField()[i][j] >= 0) free.push({ x: i, y: j });

            let index = Math.floor(Math.random() * free.length);
            let x = free[index].x;
            let y = free[index].y;
            let result = '';
            if (this._oppField()[x][y] === 1) {
                this._oppField.update(field => {let f = field.map(row => [...row]); f[x][y] = -1; return f });
                if (this.gameOver(this._oppField())) result = 'game-end';
                else {
                    result = 'hit';
                    this.crossCorners(x, y);
                    this.setNextMoves(x, y);
                }
            }
            else if (this._oppField()[x][y] === 0) {
                this._oppField.update(field => {let f = field.map(row => [...row]); f[x][y] = -2; return f });
                result = 'miss';
            }

            return { result, coords: { x, y } };
        }
        else {
            let move: { x: number, y: number, axis: number } | undefined;
            this.nextMove.update(list => {let n = [...list]; move = n.pop(); return n});
            if (!move) throw new Error('move is null');

            let x = move.x;
            let y = move.y;
            let axis = move.axis;
            let result = '';

            if (this._oppField()[x][y] === 1) {
                this._oppField.update(field => {let f = field.map(row => [...row]); f[x][y] = -1; return f });
                if (this.gameOver(this._oppField())) result = 'game-end';
                else {
                    result = 'hit';
                    this.nextMove.update(list => list.filter(m => m.axis === axis));
                    if (axis) {
                        if (this._oppField()[x][y-1] >= 0) this.nextMove.update(list => { return [...list, { x: x, y: y-1, axis: 1 }]});
                        if (this._oppField()[x][y+1] >= 0) this.nextMove.update(list => { return [...list, { x: x, y: y+1, axis: 1 }]});
                    }
                    else {
                        if (this._oppField()[x-1][y] >= 0) this.nextMove.update(list => { return [...list, { x: x-1, y: y, axis: 0 }]});
                        if (this._oppField()[x+1][y] >= 0) this.nextMove.update(list => { return [...list, { x: x+1, y: y, axis: 0 }]});
                    }
                }
            }
            else if (this._oppField()[x][y] === 0) {
                this._oppField.update(field => {let f = field.map(row => [...row]); f[x][y] = -2; return f });
                result = 'miss';
            }

            
            return { result: result, coords: { x, y } };
        }
    }

    setNextMoves(x: number, y: number) {
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx > this.fieldDim || ny < 0 || ny > this.fieldDim) continue;
                if (this._oppField()[nx][ny] >= 0) {
                    if (i === 0) {
                        this.nextMove.update(list => { return [...list, { x: nx, y: ny, axis: 0 }]});
                    }
                    if (j === 0) {
                        this.nextMove.update(list => { return [...list, { x: nx, y: ny, axis: 1 }]});
                    }
                }
            }
    }

    crossCorners(x: number, y: number) {
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                if (i === 0 || j === 0) continue;
                let nx = x + i;
                let ny = y + j;
                if (
                    nx >= 0 && nx <= this.fieldDim &&
                    ny >= 0 && ny <= this.fieldDim
                ) {
                    this._oppField.update(field => {let f = field.map(row => [...row]); f[nx][ny] = -2; return f });
                }
            }
    }

    gameOver(field: number[][]): boolean {
        for (let i = 0; i <= this.fieldDim; i++)
            for (let j = 0; j <= this.fieldDim; j++)
                if (field[i][j] === 1) return false;
        return true;
    }

    validateField(field: number[][]) {
        const visited = Array.from(
            { length: this.fieldDim + 1 },
            () => Array(this.fieldDim + 1).fill(false)
        );
        
        const ships: number[] = [];
        
        for (let i = 0; i <= this.fieldDim; i++) {
            for (let j = 0; j <= this.fieldDim; j++) {
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
        return 0;
    }

    is1Boat(x: number, y: number, field: number[][], visited: boolean[][]): boolean {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim + 1 || ny < 0 || ny >= this.fieldDim + 1) continue;
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

    isBoatEdge(x: number, y: number, field: number[][], visited: boolean[][]): { result: any, next: { x: number, y: number } } {
        let counter = 0;
        let next = { x, y };
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim + 1 || ny < 0 || ny >= this.fieldDim + 1) continue;
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

    isBoatMiddle(x: number, y: number, field: number[][], visited: boolean[][]): { result: any, next: { x: number, y: number }[] } {
        let next: { x: number, y: number }[] = [];

        if (x < 0 || x >= this.fieldDim + 1 || y < 0 || y >= this.fieldDim + 1) return { result: false, next };
        
        let numOfShipParts = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx < 0 || nx >= this.fieldDim + 1 || ny < 0 || ny >= this.fieldDim + 1) continue;
                visited[nx][ny] = true;
                if (i === 0 && j === 0) continue;
                if (field[nx][ny]) {
                    numOfShipParts++;
                    next.push({ x: nx, y: ny });
                }
            }
        }
        if (numOfShipParts !== 2) return { result: false, next };

        let v1 = (x > 0 && x < this.fieldDim) && (field[x-1][y] && field[x+1][y]);
        let v2 = (y > 0 && y < this.fieldDim) && (field[x][y-1] && field[x][y+1]);
        
        return { result: v1 || v2, next };
    }

    clear() {
        this._field.set([]);
        this._oppField.set([]);
        this.nextMove.set([]);
    }
}