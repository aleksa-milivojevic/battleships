import { Injectable, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class ChallangeService {
    private socket: Socket = io('http://localhost:3000/challange', {
        withCredentials: true,
        autoConnect: false
    });
    private storage = inject(StorageService);

    private self = signal(this.storage.getItem<User>('SELF')?.id);

    private _invites = signal<string[]>(this.storage.getItem<string[]>('INVITES') ?? []);
    readonly invites = this._invites.asReadonly();

    constructor() {
        
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
                this.handleAccept(data.source);
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
        console.log('disconnect');
        this.clear();
        this.socket.disconnect();
    }

    sendId() {
        console.log('id-response sent', this.self());
        this.socket.emit('id-response', { id: this.self() });
    }

    sendInvite(target: string) {
        console.log('invite sent');
        this.socket.emit('invite', { source: this.self(), target: target });
    }

    sendAccept(target: string) {
        console.log('accept sent');
        this.socket.emit('accept', { source: this.self(), target: target });
    }

    handleInvite(source: string) {
        console.log('handle invite from: ', source);
        this._invites.update(list => list.concat(source));
        console.log('new list ', this._invites);
        this.storage.setItem('INVITES', this._invites());
    }

    handleAccept(source: string) {
        // pokretanje igre
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
        this.self.set('');
        this.storage.removeItem('INVITES');
        console.log('clear');
    }

    updateSelf(id: string) {
        this.self.set(id);
        console.log('chall service updated to ', this.self());
    }
}