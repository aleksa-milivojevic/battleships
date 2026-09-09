import { Component, OnInit, inject, signal } from "@angular/core";
import { User, UserService } from "../../services/user.service";
import { RestrictionService } from "../../services/sockets/restriction.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { StorageService } from "../../services/storage.service";

@Component({
    selector: 'app-restrictions',
    standalone: true,
    imports: [SidebarComponent],
    templateUrl: './restrictions.component.html',
    styleUrl: './restrictions.component.scss'
})
export class RestrctionsComponent implements OnInit {
    
    readonly count = 10;

    private userService = inject(UserService);
    private restrictionService = inject(RestrictionService);
    private storage = inject(StorageService);

    users = signal<User[]>([]);

    loading = signal(false);
    more = signal(true);
    round = signal(1);
    

    self = signal<User | null>(null);

    constructor() {
        this.self.set(this.storage.getItem<User>('SELF'));
        this.loadUsers();
    }

    ngOnInit(): void {}

    loadUsers() {
        if (this.loading() || !this.more()) return;

        this.loading.set(true);

        this.userService.getAllUsers(this.self()?.id!, this.round(), this.count).subscribe({
            next: (res) => {
                this.round.update(r => r + 1);
                this.users.update(current => [...current, ...res.users]);
                this.more.set(res.more);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                console.log(err);
            }
        })
    }

    onScrollUsers(event: Event) {
        if (this.loading() && !this.more()) return;

        const element = event.target as HTMLElement;
        const threshold = 10;
        const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

        if (load) {
            console.log('load');
            this.loadUsers();
        }
    }

    onBan(target: string) {
        this.restrictionService.ban(target);
    }
}