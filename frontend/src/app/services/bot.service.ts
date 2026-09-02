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

    private _field = signal<number[][]>([]);
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

    setOppField(oppField: number[][]) {
        this._oppField.set(oppField);
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
            return false;
        }
        return taken[x][y];
    }

    create4Boat(taken: boolean[][]) {
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
            if (this.gameOver(this._field())) return 'game-end';
            return 'hit'
        }
        return 'miss';
    }

    attack(): {result: string, coords: Coords} {
        if (this.nextMove.length === 0) {
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
            else if (this._oppField()[x][y] === 0) result = 'miss';

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
            else if (this._oppField()[x][y] === 0) result = 'miss';

            
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

    clear() {
        this._field.set([]);
        this._oppField.set([]);
        this.nextMove.set([]);
    }
}