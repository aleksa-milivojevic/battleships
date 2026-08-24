import { Component, OnInit, signal } from "@angular/core";

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {

    readonly fieldDim = 10;
    
    setupPhase = signal(true);
    gamePhase = signal(false);

    field = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));

    ngOnInit(): void {}

    toggleSquare(i: number, j: number) {
        this.field.update(f => {
            if (f[i][j] === 0) f[i][j] = 1;
            else f[i][j] = 0;
            return f;
        });
    }

}