import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { GameService } from "../../services/sockets/game.service";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
    private gameService = inject(GameService);

    readonly fieldDim = 10;
    
    setupPhase = signal(false);
    gamePhase = signal(true);
    //setupPhase = this.gameService.setup;
    //gamePhase = this.gameService.game;
    myMove = this.gameService.myMove;
    fieldError = this.gameService.fieldError;
    gameOver = this.gameService.gameOver;
    win = this.gameService.win;
    surrenderMessage = this.gameService.surrenderMessage;

    // htmlMyMove = signal(this.gameService.myMove());
    htmlMyMove = signal(true);

    gameOverScreen = signal(false);

    // 1 ship, 0 empty, -1 sunk, -2 miss
    field = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));
    // 1 hit, 0 not attacked, -1 miss
    oppField = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));

    constructor() {
        effect(() => {
            this.myMove();
            if (!this.myMove()) {
                this.onMyReport();
            }
            else {
                this.onOppMove();
            }
        });
        effect(() => {
            this.gameOver();
            if (this.gameOver()) {
                this.showGameOverScreen();
            }
        })
    }

    ngOnInit(): void {}

    toggleSquare(i: number, j: number) {
        this.field.update(f => {
            if (f[i][j] === 0) f[i][j] = 1;
            else f[i][j] = 0;
            return f;
        });
    }

    onReadyUp() {
        this.gameService.readyUp(this.field());
    }

    onOppMove() {
        const { result, coords } = this.gameService.lastMove();
        const x = coords[0], y = coords[1];

        if (result === 'hit') {
            this.field.update(f => {
                f[x][y] = -1;
                return f;
            });
        }
        else if (result === 'miss') {
            this.oppField.update(f => {
                f[x][y] = -2;
                return f;
            });
        }
        else if (result === 'game-end') {
            this.oppField.update(f => {
                f[x][y] = -1;
                return f;
            });
        }

        this.htmlMyMove.set(true);
    }

    onMyReport() {
        const { result, coords } = this.gameService.lastMove();
        const x = coords[0], y = coords[1];

        if (result === 'hit') {
            this.oppField.update(f => {
                f[x][y] = 1;
                return f;
            });
        }
        else if (result === 'miss') {
            this.oppField.update(f => {
                f[x][y] = -1;
                return f;
            });
        }
        else if (result === 'game-end') {
            this.oppField.update(f => {
                f[x][y] = 1;
                return f;
            });
        }

        this.htmlMyMove.set(false);
    }

    onAttack(x: number, y: number) {
        this.gameService.myAttack([x,y]);
    }

    showGameOverScreen() {
        this.gameOverScreen.set(true);
    }

    onSurrender() {
        this.htmlMyMove.set(false);
        this.gameService.surrender();
    }

    toGameScreen() {
        this.gameService.disconnect();
        this.gameOverScreen.set(false);
    }

    toMainScreen() {
        this.gameService.disconnect();
    }
}