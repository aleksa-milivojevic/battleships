import { ApplicationRef, Injectable, inject, signal } from "@angular/core";
import { Socket } from "ngx-socket-io";

@Injectable({
    providedIn: 'root'
})
export class ChallangeService {
    private socket = inject(Socket);
    private appRef = inject(ApplicationRef);

    private self = signal('');

    private _invites = signal<string[]>([]);
    readonly invites = this._invites.asReadonly();

    constructor() {}

    connect(id: string) {
        if (this.socket.connected) return;

        this.self.set(id);

        this.socket.connect();

        this.socket.fromEvent<void>('id-request').subscribe(
            () => {
                console.log('id-request heard');
                this.sendId();
            }
        )
        
        this.socket.fromEvent<{ source: string }>('invite').subscribe(
            (data) => {
                console.log('invite heard');
                this.handleInvite(data.source);
            }
        );

        this.socket.fromEvent<{ source: string }>('accept').subscribe(
            (data) => {
                console.log('accept heard');
                this.handleAccept(data.source);
            }
        )

        this.socket.fromEvent<{ source: string }>('disconnection').subscribe(
            data => {
                console.log('disconnection heard');
                this.eraseInvite(data.source);
            }
        )
    }

    disconnect() {
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
    }

    handleAccept(source: string) {
        // pokretanje igre
    }

    eraseInvite(source: string) {
        this._invites.update(list => list.filter(item => item !== source));
    }
}