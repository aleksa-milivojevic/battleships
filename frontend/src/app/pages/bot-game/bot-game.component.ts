import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { BotService } from "../../services/bot.service";
import { StorageService } from "../../services/storage.service";
import { Router } from "@angular/router";

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
        effect(() => {
            this.myMove();
            if (this.myMove() === false) {
                this.botMove();
            }
        });
        effect(() => {
            this.gameOver();
            this.toggleGameOverScreen();
        })
    }

    ngOnInit(): void {}

    toggleSquare(i: number, j: number) {
        this.field.update(f => {
            if (f[i][j] === 0) f[i][j] = 1;
            else f[i][j] = 0;
            return f;
        });
        this.storage.setItem('MY_FIELD', this.field());
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
            this.field.update(f => {
                f[x][y] = -1;
                return f;
            })
        }
        else if (attack.result === 'miss') {
            this.field.update(f => {
                f[x][y] = -2;
                return f;
            })
            this.myMove.set(true);
        }
        else if (attack.result === 'game-end') {
            this.field.update(f => {
                f[x][y] = -1;
                return f;
            })
            this.gameOver.set(true);
        }
    }

    onAttack(x: number, y: number) {
        let report = this.bot.regiterAttack(x, y);
        if (report === 'hit') {
            this.oppField.update(f => {
                f[x][y] = 1;
                return f;
            })
        }
        else if (report === 'miss') {
            this.oppField.update(f => {
                f[x][y] = -1;
                return f;
            })
        }
        else if (report === 'game-end') {
            this.oppField.update(f => {
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
    }
}