import { Component, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { User, UserService } from "../../services/user.service";
import { NgClass } from "@angular/common";
import { AuthService } from "../../services/auth.service";


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [SidebarComponent, NgClass],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  self = this.authService.user;

  readonly count = 10;

  users = signal<User[]>([]);
  round = signal(1);
  more = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  reload() {
    this.round.set(1);
    this.more.set(true);
    this.users.set([]);
    this.loadUsers();
  }

  loadUsers() {
    if (this.loading() || !this.more()) return;

    this.loading.set(true);

    this.userService.getLeaderboard(this.round(), this.count).subscribe({
      next: (res) => {
        this.round.update(r => r + 1);
        this.users.update(current => [...current, ...res.users]);
        this.more.set(res.more);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.log(err);
        this.errorMessage.set("Error loading users");
      }
    })
  }

  onScroll(event: Event) {
    if (this.loading()) return;

    const element = event.target as HTMLElement;
    const threshold = 10;
    const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

    if (load) {
      this.loading.set(true);
      console.log('load');
      this.loadUsers();
    }
  }
}