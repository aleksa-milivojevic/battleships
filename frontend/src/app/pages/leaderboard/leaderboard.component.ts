import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { User, UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [SidebarComponent],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  self = this.authService.user;

  leaderboard = this.userService.leaderboard;
  loading = this.userService.leaderboardLoading;
  more = this.userService.more;

  ngOnInit(): void {
    this.userService.getLeaderboard();
  }

  ngOnDestroy(): void {
    this.userService.unsubLeaderboard();
    this.userService.resetLeaderboardCount();
  }

  onScroll(event: Event) {
    if (this.loading()) return;

    const element = event.target as HTMLElement;
    const threshold = 10;
    const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

    if (load && this.more()) {
      this.userService.increaseLeaderboardCount();
    }
  }
}