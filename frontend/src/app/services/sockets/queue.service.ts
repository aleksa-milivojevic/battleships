import { Injectable, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    private socket: Socket = io('http://localhost:3000/queue', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);

    private self = signal(this.storage.getItem<User>('SELF')?.id);

    constructor() {
        
    }

    connect() {
        if (this.socket.connected || !this.self()) return;

        this.socket.on('id-req',
            () => {
                console.log('id-req heard');
                this.sendId();
            }
        )

        this.socket.on('match-found',
            () => {
                console.log('match-found heard');
                this.disconnect();
            }
        )

        this.socket.connect();

        console.log("connection");
    }

    disconnect() {
        this.socket.off('id-req');
        this.socket.off('match-found');
        console.log('disconnect');
        this.socket.disconnect();
    }

    sendId() {
        console.log('id-res sent', this.self());
        this.socket.emit('id-res', { id: this.self() });
    }
}