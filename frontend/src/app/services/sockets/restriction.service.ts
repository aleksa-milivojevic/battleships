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
    // private authService = inject(AuthService);

    private self = signal<User | null>(null);

    banned = signal(false);
    timedout = signal<number | null>(null);

    constructor() {
        effect(() => {
            this.banned();
            console.log('BANNED:', this.banned());
        })
    }

    connect() {
        if (this.socket.connected) {
            console.warn('Restriction socket already connected');
            return;
        }

        this.self.set(this.storage.getItem<User>('SELF'));
        if (this.self() === undefined) {
            console.error('self is undefined');
            return;
        }

        this.listen();
        this.socket.connect();
        console.log('rs connected:', this.socket.connected);
    }

    listen() {
        this.socket.on('id-req',
            () => {
                this.idResponse();
            }
        );

        this.socket.on('banned',
            () => {
                console.log('banned heard');
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
        this.socket.off('id-req');
        this.socket.off('banned');
        this.socket.off('timed-out');
        this.socket.disconnect();
    }

    idResponse() {
        this.socket.emit('id-res', { id: this.self()?.id });
    }

    ban(target: string) {
        if (!this.self()?.admin) {
            console.warn('You are not an admin');
            return;
        }
        this.socket.emit('ban', { target });
        console.log('ban msg sent for ', target);
    }

    timeout(target: string, duration: number) {
        if (!this.self()?.admin) {
            console.warn('You are not an admin');
            return;
        }
        this.socket.emit('timeout', { target, duration });
    }

    getBanned() {
        this.banned.set(true);
        // this.disconnect();
        // this.authService.logout().subscribe({
        //     next: () => {
        //         this.router.navigate(['\home']);
        //         this.storage.setItem('BAN', true);
        //     },
        //     error: (err) => {
        //         console.error(err);
        //     }
        // });
    }

    getTimedOut(duration: number) {
        this.timedout.set(duration);
    //     this.disconnect();
    //     this.authService.logout().subscribe({
    //         next: () => {
    //             this.router.navigate(['\home']);
    //             this.storage.setItem('TIMEOUT', duration);
    //         },
    //         error: (err) => {
    //             console.error(err);
    //         }
    //     });
    }

    clearAndStoreRestrictions() {
        if (this.banned()) {
            this.storage.setItem('BAN', this.banned());
            this.banned.set(false);
        }
        if (this.timedout() !== null) {
            this.storage.setItem('TIMEOUT', this.timedout());
            this.timedout.set(null);
        }
    }
    
}