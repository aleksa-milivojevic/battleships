import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { User, UserService } from "../../../services/user.service";
import { ChatService } from "../../../services/sockets/chat.service";
import { StorageService } from "../../../services/storage.service";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReportService } from "../../../services/report.service";

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [NgClass, FormsModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
    private userService = inject(UserService);
    private reportService = inject(ReportService);
    private chatService = inject(ChatService);
    private storage = inject(StorageService);

    messages = this.chatService.messages;
    self = signal<User | null>(null);
    oppId = signal<string | null>(null);
    opp = signal<User | null>(null);

    errorMessage = signal<string>('');

    message = signal('');

    showReportOptions = signal(false);
    msgReported = signal(false);
    cheatReported = signal(false);

    winPts = signal(0);
    lossPts = signal(0);

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
                this.calculatePts();
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

    toggleReportOptions() {
        this.showReportOptions.update(o => !o);
    }

    onReport(type: string = 'cheating') {
        if (this.oppId === null || this.self()?.id === null) return;

        console.log(this.messages());
        let messages = '';
        if (type == 'messages') {
            console.log('concating')
            this.messages().forEach(message => {
                messages = messages.concat(`\n${(message.author) ? this.opp()?.username : this.self()?.username}: ${message.text}`);
            });
        }
        console.log(messages);

        this.reportService.report(this.oppId()!, this.self()?.id!, type, messages).subscribe({
            next: res => {
                console.log(res);
                if (type === 'cheating') this.cheatReported.set(true);
                else this.msgReported.set(true);
                this.showReportOptions.set(false);
            },
            error: err => {
                console.error(err);
                this.showReportOptions.set(false);
            }
        });
    }

    calculatePts() {
        let diff = Math.abs(this.self()!.score - this.opp()!.score);
        let win = 0, loss = 0;
        if (this.self()!.score >= this.opp()!.score) {
            if (diff <= 1000) {win = 150; loss = 150}
            else if (diff <= 2000) {win = 100; loss = 100}
            else if (diff <= 3000) {win = 50; loss = 50}
        }
        else {
            if (diff <= 1000) {win = 150; loss = 150}
            else if (diff <= 2000) {win = 200; loss = 200}
            else if (diff <= 3000) {win = 250; loss = 250}
        }

        if (this.self()!.score < loss) loss = this.self()!.score;

        this.winPts.set(win);
        this.lossPts.set(loss);
    }
}