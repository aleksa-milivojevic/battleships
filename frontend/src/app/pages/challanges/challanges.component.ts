import { Component, OnInit, effect, inject, signal } from "@angular/core";
import { ChallangeService } from "../../services/sockets/challange.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { User, UserService } from "../../services/user.service";

@Component({
  selector: 'app-challanges',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './challanges.component.html',
  styleUrl: './challanges.component.scss',
})
export class ChallangesComponent implements OnInit {

    private challangeService = inject(ChallangeService);
    private userService = inject(UserService);

    inviteIds = this.challangeService.invites;
    invites = signal<User[]>([]);

    loading = signal(false);
    errorMessage = signal('');

    constructor() {
        this.loadInvites();
        effect(() => {
            this.inviteIds();
            this.loadInvites();
        })
    }

    ngOnInit(): void {}

    loadInvites() {
        this.loading.set(true);

        this.userService.getFromList(this.inviteIds()).subscribe({
            next: (res) => {
                console.log(res.users);
                this.invites.set(res.users);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set(err.message);
                this.loading.set(false);
            }
        })
    }

    acceptInvite(target: string) {
        this.challangeService.sendAccept(target);
    }
}