import { Injectable, effect, inject, signal } from "@angular/core";
import { Socket, io } from "socket.io-client";
import { StorageService } from "../storage.service";
import { User } from "../user.service";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

interface ChatMessage {
    author: 0 | 1; //0 me, 1 opp
    text: string
}

@Injectable({
    providedIn: 'root'
})
export class RestrictionService {
    private socket: Socket = io('http://localhost:3000/restriction', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);
    private router = inject(Router);
    private authService = inject(AuthService);

    private self = signal<User | undefined>(undefined);

    constructor() {
        this.self.set(this.storage.getItem<User>('SELF') ?? this.self());
    }

    connect() {
        if (this.socket.connected) {
            console.warn('Chat socket already connected');
            return;
        }

        this.self.set(this.storage.getItem<User>('SELF') ?? this.self());
        if (this.self() === undefined) {
            console.error('self is undefined');
            return;
        }

        this.listen();
        this.socket.connect();
    }

    listen() {
        this.socket.on('id-req',
            () => {
                this.idResponse();
            }
        );

        this.socket.on('banned',
            () => {
                this.getBanned();
            }
        );

        this.socket.on('timed-out',
            (data) => {
                this.getTimedOut(data.duration);
            }
        );
    }

    disconnect() {
        if (this.socket.disconnected) {
            console.warn('Restriction socket already disconnected');
        }
        this.socket.disconnect();
    }

    idResponse() {
        this.socket.emit('id-res', { id: this.self() });
    }

    ban(target: string) {
        if (!this.self()?.admin) {
            console.warn('You are not an admin');
            return;
        }
        this.socket.emit('ban', { target });
    }

    timeout(target: string, duration: number) {
        if (!this.self()?.admin) {
            console.warn('You are not an admin');
            return;
        }
        this.socket.emit('timeout', { target, duration });
    }

    getBanned() {
        this.disconnect();
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['\home']);
                this.storage.setItem('BAN', true);
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    getTimedOut(duration: number) {
        this.disconnect();
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['\home']);
                this.storage.setItem('TIMEOUT', duration);
            },
            error: (err) => {
                console.error(err);
            }
        });
    }
}