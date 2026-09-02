import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { BotService } from "../../services/bot.service";
import { StorageService } from "../../services/storage.service";
import { Router } from "@angular/router";
import { ignoreElements } from "rxjs";

@Component({
    selector: 'app-bot-game',
    standalone: true,
    imports: [],
    templateUrl: './bot-game.component.html',
    styleUrl: './bot-game.component.scss'
})
export class BotGameComponent implements OnInit {
    private bot = inject(BotService);
    private storage = inject(StorageService);
    private router = inject(Router);
    
    setupPhase = signal(true);
    myMove = signal(true);
    fieldError = signal('');
    gameOver = signal(false);
    gameOverScreen = signal(false);
    win = signal(false);
    surrenderMessage = signal('');

    field = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));
    oppField = signal<number[][]>(Array.from({ length: 10 }, () => Array(10).fill(0)));

    constructor() {
        this.field.set(this.storage.getItem('MY_FIELD') ?? this.field());
        this.oppField.set(this.storage.getItem('OPP_FIELD') ?? this.oppField());
        this.myMove.set(this.storage.getItem('MY_MOVE') ?? true);
        this.gameOver.set(this.storage.getItem('GAME_OVER') ?? false);
        this.gameOverScreen.set(this.storage.getItem('GO_SCREEN') ?? false);
        this.win.set(this.storage.getItem('WIN') ?? false);
        this.fieldError.set(this.storage.getItem('FIELD_ERR') ?? '');
        this.surrenderMessage.set(this.storage.getItem('SURR_MSG') ?? '');

        effect(() => {
            this.myMove();
            if (this.myMove() === false) {
                this.botMove();
            }
            this.storage.setItem('MY_MOVE', this.myMove());
        });
        effect(() => {
            this.gameOver();
            this.toggleGameOverScreen();
            this.storage.setItem('GAME_OVER', this.gameOver());
        });
        effect(() => {
            this.field();
            this.storage.setItem('MY_FIELD', this.field());
        });
        effect(() => {
            this.oppField();
            this.storage.setItem('OPP_FIELD', this.oppField());
        });
        effect(() => {
            this.gameOverScreen();
            this.storage.setItem('GO_SCREEN', this.gameOverScreen());
        });
        effect(() => {
            this.win();
            this.storage.setItem('WIN', this.win());
        });
        effect(() => {
            this.fieldError();
            this.storage.setItem('FIELD_ERR', this.fieldError());
        });
        effect(() => {
            this.surrenderMessage();
            this.storage.setItem('SURR_MSG', this.surrenderMessage());
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
    }

    onReadyUp() {
        try {
            this.bot.setOppField(this.field());
        }
        catch (error: any) {
            this.fieldError.set(error.message);
        }
    }

    botMove() {
        let attack = this.bot.attack();
        let x = attack.coords.x;
        let y = attack.coords.y;
        if (attack.result === 'hit') {
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            })
        }
        else if (attack.result === 'miss') {
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -2;
                return f;
            })
            this.myMove.set(true);
        }
        else if (attack.result === 'game-end') {
            this.field.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            })
            this.gameOver.set(true);
        }
    }

    onAttack(x: number, y: number) {
        let report = this.bot.regiterAttack(x, y);
        if (report === 'hit') {
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = 1;
                return f;
            })
        }
        else if (report === 'miss') {
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = -1;
                return f;
            })
        }
        else if (report === 'game-end') {
            this.oppField.update(field => {
                let f = field.map(row => [...row]);
                f[x][y] = 1;
                return f;
            })
            this.gameOver.set(true);
            this.win.set(true);
        }
    }

    onSurrender() {
        this.gameOver.set(true);
        this.surrenderMessage.set('You have surrendered');
    }

    toggleGameOverScreen() {
        this.gameOverScreen.update(o => !o);
    }

    toMainScreen() {
        this.bot.clear();
        this.clearLocal();
        this.router.navigate(['/main']);
    }

    clearLocal() {
        this.storage.removeItem('MY_FIELD');
        this.storage.removeItem('OPP_FIELD');
        this.storage.removeItem('MY_MOVE');
        this.storage.removeItem('GAME_OVER');
        this.storage.removeItem('GO_SCREEN');
        this.storage.removeItem('WIN');
        this.storage.removeItem('FIELD_ERR');
        this.storage.removeItem('SURR_MSG');
    }
}