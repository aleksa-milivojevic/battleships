import { Injectable, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    private socket: Socket = io('http://localhost:3000/game', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);

    private self = signal<string | undefined>(undefined);

    private opp = signal<User | null>(null);

    setup = signal(true);
    game = signal(false);

    lastMove = signal<{ result: string, coords: number[] }>({ result: '', coords: [] });

    gameOver = signal(false);
    win = signal(false);

    myMove = signal(false);

    oppReady = signal(false);
    imReady = signal(false);

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

        this.opp.set(this.storage.getItem<User>('OPP'));

        if (this.opp() === null) {
            console.log('opp unknown');
            return;
        }

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
        this.socket.emit('id-res', { id: this.self(), opp: this.opp()?.id });
    }

    readyUp() {
        this.imReady.set(true);
        this.socket.emit('ready');
        if (this.oppReady()) {
            this.setup.set(false);
            this.game.set(true);
        }
    }

    ready() {
        this.oppReady.set(true);
        if (this.imReady()) {
            this.setup.set(false);
            this.game.set(true);
        }
    }

    oppAttack(data: { result: string, coords: number[] }) {
        this.lastMove.set({ result: data.result, coords: data.coords });
        this.myMove.set(true);
        if (data.result === 'game-end') this.gameOver.set(true);
    }

    myAttack(coords: number[]) {
        this.socket.emit('attack', { coords });
    }

    report(data: { result: string, coords: number[] }) {
        this.lastMove.set({ result: 'hit', coords: data.coords });
        this.myMove.set(false);
        if (data.result === 'game-end') {
            this.gameOver.set(true);
            this.win.set(true);
        }
    }
}