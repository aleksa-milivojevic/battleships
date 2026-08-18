import { ApplicationRef, Injectable, inject, signal } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { AuthService } from "../auth.service";

@Injectable({
    providedIn: 'root'
})
export class ChallangeService {
    private socket = inject(Socket);
    private appRef = inject(ApplicationRef);
    private authService = inject(AuthService);

    private self = this.authService.user;

    private _invites = signal<string[]>([]);
    readonly invites = this._invites.asReadonly();

    constructor() {
        this.socket.connect();

        this.socket.fromEvent<void>('id-request').subscribe(
            () => {
                this.sendId();
                this.appRef.tick();
            }
        )
        
        this.socket.fromEvent<{ source: string }>('invite').subscribe(
            (data) => {
                this.handleInvite(data.source);
                this.appRef.tick();
            }
        );

        this.socket.fromEvent<{ source: string }>('accept').subscribe(
            (data) => {
                this.handleAccept(data.source);
                this.appRef.tick();
            }
        )

        this.socket.fromEvent<{ source: string }>('dissconnection').subscribe(
            data => {
                this.eraseInvite(data.source);
                this.appRef.tick();
            }
        )
    }

    sendId() {
        this.socket.emit('id-response', { id: this.self()?.id });
    }

    sendInvite(target: string) {
        this.socket.emit('invite', { source: this.self()?.id, target: target });
    }

    sendAccept(target: string) {
        this.socket.emit('accept', { source: this.self()?.id, target: target });
    }

    handleInvite(source: string) {
        this._invites.update(list => list.concat(source));
    }

    handleAccept(source: string) {
        // pokretanje igre
    }

    eraseInvite(source: string) {
        this._invites.update(list => list.filter(item => item !== source));
    }
}