import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { User, UserService } from "../../services/user.service";
import { RestrictionService } from "../../services/sockets/restriction.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { StorageService } from "../../services/storage.service";
import { Report, ReportService, ReportedUser } from "../../services/report.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-restrictions',
    standalone: true,
    imports: [SidebarComponent, FormsModule, ReactiveFormsModule],
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
    restrictedUsers = signal<User[]>([]);

    selectedUser = signal<User | null>(null);
    reportList = signal<Report[]>([]);

    more1 = signal(true);
    more2 = signal(true);

    reportedOrRestricted = signal(false); //false => reported, true => restricted

    duration = signal<number>(0);

    selectedReport = signal('');
    showReportMessages = signal(false);

    constructor() {
        this.self.set(this.storage.getItem<User>('SELF'));
        effect(() => {
            this.reportedOrRestricted();
            
            if (this.reportedOrRestricted()) {
                this.loadRestrictedUsers();
            }
            else {
                this.loadReportedUsers();
            }
        })
    }

    ngOnInit(): void {}

    loadReportedUsers() {
        if (this.loading() || !this.more1()) return;

        this.loading.set(true);

        this.reportService.getAll(this.round1(), this.count).subscribe({
            next: (res) => {
                this.reportedUsers.update(list => [...list, ...res.users]);
                this.more1.set(res.more);
                this.round1.update(num => num + 1);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                console.log(err);
            }
        })
    }

    loadRestrictedUsers() {
        if (this.loading() || !this.more2()) return;

        this.loading.set(true);

        this.userService.getRestricted(this.round2(), this.count).subscribe({
            next: (res) => {
                this.restrictedUsers.update(list => [...list, ...res.users]);
                this.more2.set(res.more);
                this.round2.update(o => o + 1);
                this.loading.set(false);
                console.log(this.restrictedUsers());
            },
            error: (err) => {
                this.loading.set(false);
                console.log(err);
            }
        })
    }

    onScroll(event: Event) {
        if (this.loading()) return;
        if (this.reportedOrRestricted() && !this.more2()) return;
        if (!this.reportedOrRestricted() && this.more1()) return;

        const element = event.target as HTMLElement;
        const threshold = 10;
        const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

        if (load) {
            console.log('load');
            if (this.reportedOrRestricted()) {
                this.loadRestrictedUsers();
            }
            else {
                this.loadReportedUsers();
            }
        }
    }

    toggleList() {
        this.reportedOrRestricted.update(o => !o);
        if (this.reportedOrRestricted()) {
            this.selectedUser.set(null);
            this.reportList.set([]);
        }
    }

    selectUser(reportedUser: ReportedUser) {
        this.selectedUser.set(reportedUser.user);
        this.reportList.set(reportedUser.reports);
    }

    onBan(target: string) {
        const user = this.reportedUsers().find(user => user.user.id === target)?.user;
        if (!user) return;
        this.restrictionService.ban(target);
        user.banned = true;
        this.restrictedUsers.update(curr => [...curr, user]);
        this.reportedUsers.set(this.reportedUsers().filter(user => user.user.id !== target));
        this.reportList.set([]);
    }

    onTimeout(target: string, duration: number) {
        const user = this.reportedUsers().find(user => user.user.id === target)?.user;
        if (!user) return;
        this.restrictionService.timeout(target, duration);
        user.timeout?.setDate((new Date()).getHours() + duration * 24);
        this.restrictedUsers.update(curr => [...curr, user]);
        this.reportedUsers.update(list => list.filter(user => user.user.id !== target));
        this.reportList.set([]);
    }

    onUnrestrict(target: string) {
        let user = this.restrictedUsers().find(el => el.id === target);

        if (!user) return;

        if (user.banned) {
            this.restrictionService.unban(target);
        }
        else if (user.timeout !== null) {
            this.restrictionService.untimeout(target);
        }

        this.restrictedUsers.update(list => list.filter(user => user.id !== target));
    }

    selectReport(id: string) {
        if (!this.showReportMessages()) return;
        this.selectedReport.set(id);
    }

    toggleReportMessages(id: string) {
        if (this.selectedReport() === id) {
            this.showReportMessages.set(false);
            this.selectedReport.set('');
        }
        else this.showReportMessages.set(true);
    }

    parsedDate(user: User) {
        console.log(user.timeout);
        return user.timeout?.toString().slice(0, 10).split('-').join('. ').concat('.');
    }
}