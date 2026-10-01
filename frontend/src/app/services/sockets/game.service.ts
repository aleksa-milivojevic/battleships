import { Injectable, computed, effect, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";
import { AuthService } from "../auth.service";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private socket: Socket = io('http://localhost:3000/game', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);
    private authService = inject(AuthService);

    private self = signal<string | undefined>(undefined);

    private opp = signal<string | null>(null);

    private reconnectTimeout = signal<number | undefined>(undefined);

    setup = signal(true);
    game = signal(false);

    lastMove = signal<{ result: string, coords: number[] }>({ result: '', coords: [] });

    gameOver = signal(false);
    win = signal(false);

    myMove = signal(false);

    oppReady = signal(false);
    imReady = signal(false);

    fieldError = signal('');

    surrenderMessage = signal('');

    disconnected = signal(false);
    waiting = signal(false);

    canEnter = signal(false);
    canLeave = signal(true);

    private readonly setupTime = 180;
    private readonly moveTime = 60; 
    private _timer = signal<number | null>(null);
    timer = this._timer.asReadonly();
    private isRunning = signal(false);
    private intervalId: number | null = null;

    constructor() {
        this.canEnter.set(this.storage.getItem<boolean>('GAME_CAN_ENTER') ?? this.canEnter());
        this.canLeave.set(this.storage.getItem<boolean>('GAME_CAN_LEAVE') ?? this.canLeave());

        effect(() => {
            this.canEnter();
            this.storage.setItem('GAME_CAN_ENTER', this.canEnter());
        });
        effect(() => {
            this.canLeave();
            this.storage.setItem('GAME_CAN_LEAVE', this.canLeave());
        });
    }

    connect() {
        if (this.socket.connected) {
            console.log('already connected');
            return;
        }

        this.self.set(this.storage.getItem<User>('SELF')?.id);

        if (this.self() === undefined) {
            console.log('self undefined');
            return;
        }

        this.opp.set(this.storage.getItem<string>('OPP'));

        if (this.opp() === null) {
            console.log('opp unknown');
            return;
        }

        this.myMove.set(this.storage.getItem<boolean>('FIRST') ?? false);
        console.log('my move: ', this.myMove());

        this.setup.set(this.storage.getItem<boolean>('SETUP') ?? true);
        this.game.set(this.storage.getItem<boolean>('GAME') ?? false);
        this.gameOver.set(this.storage.getItem<boolean>('GAME_OVER') ?? false);
        this.win.set(this.storage.getItem<boolean>('WIN') ?? false);
        this.oppReady.set(this.storage.getItem<boolean>('OPP_READY') ?? false);
        this.imReady.set(this.storage.getItem<boolean>('IM_READY') ?? false);
        this.fieldError.set(this.storage.getItem<string>('FIELD_ERROR') ?? '');
        this.surrenderMessage.set(this.storage.getItem<string>('SURR_MSG') ?? '');
        this.lastMove.set(this.storage.getItem<{ result: string, coords: number[] }>('LAST_MOVE') ?? { result: '', coords: [] });
        this.disconnected.set(this.storage.getItem('DISCONNECT') ?? false);
        this.waiting.set(this.storage.getItem('WAIT') ?? false);

        this.isRunning.set(this.storage.getItem('IS_RUNNING') ?? this.isRunning());
        this.intervalId = this.storage.getItem('INTERVAL_ID');

        this._timer.set(this.storage.getItem('TIMER') ?? this.setupTime);
        setTimeout(() => this.startTimer(), 2000);

        effect(() => {
            this._timer();
            this.storage.setItem('TIMER', this._timer());
        })

        this.socket.on('id-req',
            () => {
                console.log('id-req heard');
                this.sendId();
            }
        )

        this.socket.on('ready',
            () => {
                console.log('ready heard');
                this.ready();
            }
        )

        this.socket.on('attack',
            (data) => {
                console.log('attack heard');
                this.oppAttack(data);
            }
        )

        this.socket.on('report',
            (data) => {
                console.log('report heard');
                this.report(data);
            }
        )

        this.socket.on('surrender',
            () => {
                console.log('surrender heard');
                this.oppSurrender();
            }
        )

        this.socket.on('disconnection',
            () => {
                console.log('disconnection heard');
                this.onDisconnect();
            }
        )

        this.socket.on('reconnect',
            () => {
                console.log('reconnect heard');
                this.onReconnect();
            }
        )

        this.socket.on('exception',
            (data) => {
                console.log('exception heard');
                console.log(data);
                this.error(data);
            }
        )

        this.socket.on('points',
            (data) => {
                console.log('points heard');
                this.updateScore(data.points);
            }
        )

        this.socket.connect();

        console.log("connection");
    }

    disconnect() {
        if (!this.socket.connected) return;
        this.socket.off('id-req');
        this.socket.off('ready');
        this.socket.off('attack');
        this.socket.off('report');
        this.socket.off('surrender');
        this.socket.off('disconnection');
        this.socket.off('reconnect');
        this.socket.off('exception');
        this.socket.off('points');
        this.stopTimer();
        console.log('disconnect');
        this.socket.disconnect();
    }

    sendId() {
        console.log('id-res sent');
        this.socket.emit('id-res', { id: this.self(), opp: this.opp() });
    }

    readyUp(field: number[][]) {
        this.imReady.set(true);
        this.storage.setItem('IM_READY', true);
        this.socket.emit('ready', { field });
        this.fieldError.set('');
        this.stopTimer();
        if (this.oppReady()) {
            this.setup.set(false);
            this.storage.setItem('SETUP', false);
            this.game.set(true);
            this.storage.setItem('GAME', true);
            this.resetTimer();
        }
    }

    ready() {
        this.oppReady.set(true);
        this.storage.setItem('OPP_READY', true);
        if (this.imReady()) {
            this.setup.set(false);
            this.storage.setItem('SETUP', false);
            this.game.set(true);
            this.storage.setItem('GAME', true);
            this.resetTimer();
        }
    }

    oppAttack(data: { result: string, coords: number[] }) {
        console.log('attack: ', data.result, data.coords);
        this.lastMove.set({ result: data.result, coords: data.coords });
        this.storage.setItem('LAST_MOVE', { result: data.result, coords: data.coords });
        this.resetTimer();
        if (data.result === 'miss') {
            this.myMove.set(true);
            this.storage.setItem('FIRST', true);    
        }
        if (data.result === 'game-end') {
            this.stopTimer();
            this.gameOver.set(true);
            this.storage.setItem('GAME_OVER', true);
        }
        
    }

    myAttack(coords: number[]) {
        this.stopTimer();
        this.socket.emit('attack', { coords });
    }

    report(data: { result: string, coords: number[] }) {
        console.log('report: ', data.result, data.coords);
        this.lastMove.set({ result: data.result, coords: data.coords });
        this.storage.setItem('LAST_MOVE', { result: data.result, coords: data.coords });
        this.resetTimer();
        if (data.result === 'miss') {
            this.myMove.set(false);
            this.storage.setItem('FIRST', false);
        }
        if (data.result === 'game-end') {
            this.stopTimer();
            this.gameOver.set(true);
            this.storage.setItem('GAME_OVER', true);
            this.win.set(true);
            this.storage.setItem('WIN', true);
        }
    }

    surrender() {
        this.stopTimer();
        this.myMove.set(false);
        this.storage.setItem('FIRST', false);
        this.gameOver.set(true);
        this.storage.setItem('GAME_OVER', true);
        this.surrenderMessage.set('You Have Surrendered');
        this.storage.setItem('SURR_MSG', this.surrenderMessage());
        this.socket.emit('surrender');
    }

    oppSurrender() {
        this.stopTimer();
        this.gameOver.set(true);
        this.storage.setItem('GAME_OVER', true);
        this.win.set(true);
        this.storage.setItem('WIN', true);
        this.surrenderMessage.set('Opponent Surrendered');
        this.storage.setItem('SURR_MSG', this.surrenderMessage());
    }

    error(data: { message: string }) {
        if (data.message.startsWith('Field')) {
            console.log(data.message);
            this.fieldError.set(data.message);
            this.storage.setItem('FIELD_ERROR', this.fieldError());
        }
        if (data.message.endsWith('Opponent')) {
            console.log(data.message);
            this.surrenderMessage.set('You disconnected');
            this.storage.setItem('SURR_MSG', this.surrenderMessage());
            this.disconnected.set(true);
            this.storage.setItem('DISCONNECT', true);
        }
    }

    clear() {
        this.storage.removeItem('FIRST');
        this.storage.removeItem('OPP');
        this.storage.removeItem('SETUP');
        this.storage.removeItem('GAME');
        this.storage.removeItem('GAME_OVER');
        this.storage.removeItem('WIN');
        this.storage.removeItem('OPP_READY');
        this.storage.removeItem('IM_READY');
        this.storage.removeItem('FIELD_ERROR');
        this.storage.removeItem('SURR_MSG');
        this.storage.removeItem('LAST_MOVE');
        this.storage.removeItem('DISCONNECT');
        this.storage.removeItem('WAIT');
        this.storage.removeItem('TIMER');
    }

    back() {
        this.gameOver.set(false);
        this.myMove.set(false);
        this.setup.set(true);
        this.game.set(false);
        this.lastMove.set({ result: '', coords: [] });
        this.win.set(false);
        this.oppReady.set(false);
        this.imReady.set(false);
        this.fieldError.set('');
        this.surrenderMessage.set('');
        this.disconnected.set(false);
        this.waiting.set(false);
        this._timer.set(null);
        this.clear();
    }

    onDisconnect() {
        if (this.gameOver()) return;
        this.reconnectTimeout.set(setTimeout(() => this.oppDisconnect(), 5000));
        this.waiting.set(true);
        this.storage.setItem('WAIT', true);
    }

    onReconnect() {
        clearTimeout(this.reconnectTimeout());
        this.waiting.set(false);
        this.storage.setItem('WAIT', false);
    }

    oppDisconnect() {
        this.stopTimer();
        this.socket.emit('opp-disconnect');
        this.waiting.set(false);
        this.storage.setItem('WAIT', false);
        this.gameOver.set(true);
        this.storage.setItem('GAME_OVER', true);
        this.win.set(true);
        this.storage.setItem('WIN', true);
        this.surrenderMessage.set('Opponent Disconnected');
        this.storage.setItem('SURR_MSG', this.surrenderMessage());
    }

    updateScore(points: number) {
        if (!this.gameOver()) return;
        const user = this.storage.getItem<User>('SELF');
        if (!user) return;
        if (this.win()) user.score += points; 
        else user.score -= points;
        this.authService.updateSelf(user);
    }

    startTimer() {
        if (this.isRunning() || this._timer() === null) return;

        this.isRunning.set(true);
    
        this.intervalId = setInterval(() => {
            this._timer.update((time) => {
                if (time! <= 1) {
                    this.stopTimer();
                    if (this.myMove()) {
                        this.surrender();
                    }
                    return 0;
                }
                return time! - 1;
            });
        }, 1000);
    }

    stopTimer() {
        if (!this.isRunning()) return;

        this.isRunning.set(false);
        
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this._timer.set(this.moveTime);
        this.startTimer();
    }
}