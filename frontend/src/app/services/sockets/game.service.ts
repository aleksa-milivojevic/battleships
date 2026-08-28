import { Injectable, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private socket: Socket = io('http://localhost:3000/game', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);

    private self = signal<string | undefined>(undefined);

    private opp = signal<string | null>(null);

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

    constructor() {
        
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

        this.socket.on('exception',
            (data) => {
                console.log('exception heard');
                this.error(data);
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
        if (this.oppReady()) {
            this.setup.set(false);
            this.storage.setItem('SETUP', false);
            this.game.set(true);
            this.storage.setItem('GAME', true);
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
        }
    }

    oppAttack(data: { result: string, coords: number[] }) {
        console.log('attack: ', data.result, data.coords);
        this.lastMove.set({ result: data.result, coords: data.coords });
        this.storage.setItem('LAST_MOVE', { result: data.result, coords: data.coords });
        if (data.result === 'miss') {
            this.myMove.set(true);
            this.storage.setItem('FIRST', true);    
        }
        if (data.result === 'game-end') {
            this.gameOver.set(true);
            this.storage.setItem('GAME_OVER', true);
        }
    }

    myAttack(coords: number[]) {
        this.socket.emit('attack', { coords });
    }

    report(data: { result: string, coords: number[] }) {
        console.log('report: ', data.result, data.coords);
        this.lastMove.set({ result: data.result, coords: data.coords });
        this.storage.setItem('LAST_MOVE', { result: data.result, coords: data.coords });
        if (data.result === 'miss') {
            this.myMove.set(false);
            this.storage.setItem('FIRST', false);
        }
        if (data.result === 'game-end') {
            this.gameOver.set(true);
            this.storage.setItem('GAME_OVER', true);
            this.win.set(true);
            this.storage.setItem('WIN', true);
        }
    }

    surrender() {
        this.myMove.set(false);
        this.storage.setItem('FIRST', false);
        this.gameOver.set(true);
        this.storage.setItem('GAME_OVER', true);
        this.surrenderMessage.set('You Have Surrendered');
        this.storage.setItem('SURR_MSG', this.surrenderMessage());
        this.socket.emit('surrender');
    }

    oppSurrender() {
        this.gameOver.set(true);
        this.storage.setItem('GAME_OVER', true);
        this.win.set(true);
        this.storage.setItem('WIN', true);
        this.surrenderMessage.set('Opponent Surrendered');
        this.storage.setItem('SURR_MSG', this.surrenderMessage());
    }

    error(data: { message: string }) {
        if (data.message.startsWith('Field')) {
            this.fieldError.set(data.message);
            this.storage.setItem('FIELD_ERROR', this.fieldError());
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
        this.clear();
    }
}