import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { User, UserService } from "../../services/user.service";
import { RestrictionService } from "../../services/sockets/restriction.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { StorageService } from "../../services/storage.service";
import { Report, ReportService, ReportedUser } from "../../services/report.service";

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
    private reportService = inject(ReportService);
    private restrictionService = inject(RestrictionService);
    private storage = inject(StorageService);

    reports = signal<Report[]>([]);

    loading = signal(false);

    self = signal<User | null>(null);

    round1 = signal(1);
    round2 = signal(1);

    reportedUsers = signal<ReportedUser[]>([]);

    more = signal(true);

    reportedOrRestricted = signal(false); //false => reported, true => restricted

    constructor() {
        this.self.set(this.storage.getItem<User>('SELF'));
        effect(() => {
            this.reportedOrRestricted();
            if (this.reportedOrRestricted()) {
                // this.loadRestrictedUsers();
            }
            else {
                this.loadReportedUsers();
            }
        })
    }

    ngOnInit(): void {}

    loadReportedUsers() {
        if (this.loading() || !this.more()) return;

        this.loading.set(true);

        this.reportService.getAll(this.round1(), this.count).subscribe({
            next: (res) => {
                this.reportedUsers.update(list => [...list, ...res.users]);
                this.more.set(res.more);
                this.round1.update(num => num + 1);
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
            if (this.reportedOrRestricted()) {
                // this.loadRestrictedUsers();
            }
            else {
                this.loadReportedUsers();
            }
        }
    }

    onBan(target: string) {
        this.restrictionService.ban(target);
    }
}