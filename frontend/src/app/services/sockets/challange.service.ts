import { Injectable, effect, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";
import { Router } from "@angular/router";
import { GameService } from "./game.service";
import { AuthService } from "../auth.service";

@Injectable({
    providedIn: 'root'
})
export class ChallangeService {
    private socket: Socket = io('http://localhost:3000/challange', {
        withCredentials: true,
        autoConnect: false
    });
    private storage = inject(StorageService);
    private router = inject(Router);
    private gameService = inject(GameService);
    private authService = inject(AuthService);

    private self = this.authService.user;

    private _invites = signal<string[]>(this.storage.getItem<string[]>('INVITES') ?? []);
    readonly invites = this._invites.asReadonly();

    constructor() {
        effect(() => {
            this.self();
            if (this.self()) {
                this.connect();
            }
            else {
                this.disconnect();
            }
        })
    }

    listen() {
        console.log("listen");
        this.socket.on('id-request',
            () => {
                console.log('id-request heard');
                this.sendId();
            }
        )
    
        this.socket.on('invite',
            (data) => {
                console.log('invite heard');
                this.handleInvite(data.source);
            }
        )

        this.socket.on('accept',
            (data) => {
                console.log('accept heard');
                this.handleAccept(data);
            }
        )

        this.socket.on('disconnection',
            data => {
                console.log('disconnection heard');
                this.eraseInvite(data.source);
            }
        )
    }

    connect() {
        if (this.socket.connected || !this.self()) return;
        
        this.listen();
        
        this.socket.connect();

        console.log("connection");
    }

    disconnect() {
        if (this.socket.disconnected) return;
        console.log('disconnect');
        this.clear();
        this.socket.disconnect();
    }

    sendId() {
        console.log('id-response sent', this.self()?.id);
        this.socket.emit('id-response', { id: this.self()?.id });
    }

    sendInvite(target: string) {
        console.log('invite sent');
        this.socket.emit('invite', { source: this.self()?.id, target: target });
    }

    sendAccept(target: string) {
        console.log('accept sent', this.self()?.id, " ", target);
        this.socket.emit('accept', { source: this.self()?.id, target: target });
    }

    handleInvite(source: string) {
        console.log('handle invite from: ', source);
        this._invites.update(list => list.concat(source));
        console.log('new list ', this._invites);
        this.storage.setItem('INVITES', this._invites());
    }

    handleAccept(data: { source: string, myMove: boolean}) {
        console.log('data', data);
        this.storage.setItem('OPP', data.source);
        this.storage.setItem('FIRST', data.myMove);
        this.eraseInvite(data.source);
        this.gameService.canEnter.set(true);
        this.router.navigate(['/game']);
        this.gameService.canLeave.set(false);
    }

    eraseInvite(source: string) {
        this._invites.update(list => list.filter(item => item !== source));
    }

    clear() {
        this.socket.off('id-request');
        this.socket.off('invite');
        this.socket.off('accept');
        this.socket.off('disconnection');
        this._invites.set([]);
        this.storage.removeItem('INVITES');
        console.log('clear');
    }
}