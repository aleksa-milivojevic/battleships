import { Injectable, inject, signal } from "@angular/core";
import { Socket, io } from "socket.io-client";
import { StorageService } from "../storage.service";
import { User } from "../user.service";

interface ChatMessage {
    author: 0 | 1; //0 me, 1 opp
    text: string
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private socket: Socket = io('http://localhost:3000/chat', {
        withCredentials: true,
        autoConnect: false
    });

    private storage = inject(StorageService);

    private self = signal<string | undefined>(undefined);
    private opp = signal<string | null>(null);

    messages = signal<ChatMessage[]>([]);

    constructor() {
        this.connect();
    }

    connect() {
        if (this.socket.connected) {
            console.warn('Chat socket already connected');
            return;
        }

        this.self.set(this.storage.getItem<User>('SELF')?.id);
        if (this.self() === undefined) {
            console.error('self is undefined');
            return;
        }

        this.opp.set(this.storage.getItem<string>('OPP'));
        if (this.opp() === null) {
            console.error('opp is unknown');
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

        this.socket.on('message',
            (data) => {
                this.recieveMessage(data.text);
            }
        );
    }

    idResponse() {
        this.socket.emit('id-res', { id: this.self(), opp: this.opp() });
    }

    sendMessage(text: string) {
        this.socket.emit('message', { text });
        this.messages.update(list => [...list, { author: 0, text }]);
    }

    recieveMessage(text: string) {
        this.messages.update(list => [...list, { author: 1, text }]);
    }
}