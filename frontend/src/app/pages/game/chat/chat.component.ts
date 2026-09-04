import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { User, UserService } from "../../../services/user.service";
import { ChatService } from "../../../services/sockets/chat.service";
import { StorageService } from "../../../services/storage.service";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [NgClass, FormsModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
    private userService = inject(UserService);
    private chatService = inject(ChatService);
    private storage = inject(StorageService);

    messages = this.chatService.messages;
    self = signal<User | null>(null);
    oppId = signal<string | null>(null);
    opp = signal<User | null>(null);

    errorMessage = signal<string>('');

    message = signal('');

    constructor() {
        this.self.set(this.storage.getItem<User>('SELF'));
        this.oppId.set(this.storage.getItem<string>('OPP'));
        this.getOpp();
        this.chatService.connect();
    }
    ngOnDestroy(): void {
        this.chatService.disconnect();
    }

    ngOnInit(): void {}

    getOpp() {
        if (this.oppId() === null) {
            console.warn('Cant load opp, opp is null');
            return;
        }

        this.userService.getFromList([this.oppId()!]).subscribe({
            next: (res) => {
                this.opp.set(res.users[0]);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('Could not load opp info');
            }
        });
    }

    sendMessage() {
        this.chatService.sendMessage(this.message());
        this.message.set('');
    }
}