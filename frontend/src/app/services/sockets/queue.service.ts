import { Injectable, inject, signal } from "@angular/core";
import {  } from "ngx-socket-io";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { io, Socket } from "socket.io-client";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    private socket: Socket = io('http://localhost:3000/queue', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);
    private router = inject(Router);

    private self = signal<string | undefined>(undefined);

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

        this.socket.on('id-req',
            () => {
                console.log('id-req heard');
                this.sendId();
            }
        )

        this.socket.on('match-found',
            (data) => {
                console.log('match-found heard');
                this.saveLocal(data);
                this.disconnect();
                this.router.navigate(['/game']);
            }
        )

        this.socket.connect();

        console.log("connection");
    }

    disconnect() {
        if (!this.socket.connected) return;
        this.socket.off('id-req');
        this.socket.off('match-found');
        console.log('disconnect');
        this.socket.disconnect();
    }

    sendId() {
        console.log('id-res sent', this.self());
        this.socket.emit('id-res', { id: this.self() });
    }

    saveLocal(data: { oppId: string, myMove: boolean }) {
        this.storage.setItem('OPP', data.oppId);
        this.storage.setItem('FIRST', data.myMove);
    }
}