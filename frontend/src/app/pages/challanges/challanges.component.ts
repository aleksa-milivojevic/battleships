import { Component, OnInit, inject, signal } from "@angular/core";
import { ChallangeService } from "../../services/sockets/challange.service";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { User } from "../../services/user.service";

@Component({
  selector: 'app-challanges',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './challanges.component.html',
  styleUrl: './challanges.component.scss',
})
export class ChallangesComponent implements OnInit {

    private challangeService = inject(ChallangeService);

    inviteIds = this.challangeService.invites;
    invites = signal<User[]>([]);

    constructor() {
        this.loadInvites();
    }

    ngOnInit(): void {}

    loadInvites() {
        
    }

    acceptInvite(target: string) {
        this.challangeService.sendAccept(target);
    }
}