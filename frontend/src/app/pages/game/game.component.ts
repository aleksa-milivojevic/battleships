import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { GameService } from "../../services/sockets/game.service";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { StorageService } from "../../services/storage.service";

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
    private gameService = inject(GameService);
    private router = inject(Router);
    private storage = inject(StorageService);

    readonly fieldDim = 10;
    
    // setupPhase = signal(false);
    // gamePhase = signal(true);
    setupPhase = this.gameService.setup;
    gamePhase = this.gameService.game;
    myMove = this.gameService.myMove;
    fieldError = this.gameService.fieldError;
    gameOver = this.gameService.gameOver;
    win = this.gameService.win;
    surrenderMessage = this.gameService.surrenderMessage;
    disconnected = this.gameService.disconnected;
    waiting = this.gameService.waiting;

    htmlMyMove = signal(false);
    // htmlMyMove = signal(true);

    gameOverScreen = signal(false);

    // 1 ship, 0 empty, -1 sunk, -2 miss
    field = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));
    // 1 hit, 0 not attacked, -1 miss
    oppField = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));

    constructor() {
        this.gameService.connect();
        this.field.set(this.storage.getItem('MY_FIELD') ?? this.field());
        this.oppField.set(this.storage.getItem('OPP_FIELD') ?? this.oppField());
        this.htmlMyMove.set(this.storage.getItem('FIRST') ?? false);
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
        });
        effect(() => {
            this.gamePhase();
            if (this.gamePhase()) {
                this.htmlMyMove.set(this.gameService.myMove());
            }
        });
    }

    ngOnInit(): void {}

    toggleSquare(i: number, j: number) {
        this.field.update(field => {
            let f = field.map(row => [...row]);
            if (f[i][j] === 0) f[i][j] = 1;
            else f[i][j] = 0;
            return f;
        });
        this.storage.setItem('MY_FIELD', this.field());
    }

    onReadyUp() {
        this.gameService.readyUp(this.field());
        this.storage.setItem('MY_FIELD', this.field());
    }

    onOppMove() {
        const { result, coords } = this.gameService.lastMove();
        const x = coords[0], y = coords[1];

        if (result === 'hit') {
            console.log('updating field: ', result, coords);
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            });
        }
        else if (result === 'miss') {
            console.log('updating field: ', result, coords);
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -2;
                return f;
            });
            this.htmlMyMove.set(true);
        }
        else if (result === 'game-end') {
            console.log('updating field: ', result, coords);
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            });
        }
        this.storage.setItem('MY_FIELD', this.field());
    }

    onMyReport() {
        const { result, coords } = this.gameService.lastMove();
        const x = coords[0], y = coords[1];

        if (result === 'hit') {
            console.log('updating opp field: ', result, coords);
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = 1;
                return f;
            });
        }
        else if (result === 'miss') {
            console.log('updating opp field: ', result, coords);
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            });
            this.htmlMyMove.set(false);
        }
        else if (result === 'game-end') {
            console.log('updating opp field: ', result, coords);
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = 1;
                return f;
            });
        }
        this.storage.setItem('OPP_FIELD', this.oppField());
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
        this.gameService.back();
        this.router.navigate(['main']);
        this.clearLocal();
    }

    onBack() {
        this.router.navigate(['/main']);
        this.gameService.back();
        this.clearLocal();
    }

    clearLocal() {
        this.storage.removeItem('OPP_FIELD');
        this.storage.removeItem('MY_FIELD');
    }
}