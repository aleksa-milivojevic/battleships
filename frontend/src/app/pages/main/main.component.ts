import { Component, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from "@angular/forms";
import { User, UserService } from '../../services/user.service';
import { Match, MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { ChallangeService } from '../../services/sockets/challange.service';
import { QueueService } from '../../services/sockets/queue.service';
import { Router } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule, FooterComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private userService = inject(UserService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  private challangeService = inject(ChallangeService);
  private queueService = inject(QueueService);
  private botService = inject(BotService);
  private router = inject(Router);

  self = this.authService.user;
  
  readonly count = 10;

  overlay = signal(false);
  search = signal<string | null>(null);
  u_round = signal(1);
  u_more = signal(true);
  loading = signal(false);
  searchErr = signal('');

  m_round = signal(1);
  m_more = signal(true);

  users = signal<User[]>([]);
  challanged = signal<string[]>([]);

  matches = signal<Match[]>([]);

  showQueueScreen = signal(false);

  showingInfo = signal(false);
  infoX = signal(0);
  infoY = signal(0);
  hovered = signal<User | null>(null);

  constructor() {
    effect(() => {
      this.search();

      untracked(() => {
        if (this.search() !== null)
          this.reloadUsers()
      });
    });
  }

  ngOnInit(): void {
    this.loadMatches();
  }

  reloadUsers() {
    this.u_round.set(1);
    this.u_more.set(true);
    this.users.set([]);
    this.loadUsers();
  }

  loadUsers() {
    if (this.loading() || !this.u_more() || this.search() === null) return;

    this.loading.set(true);

    this.userService.getAllUsers(this.self()?.id!, this.u_round(), this.count,  this.search() ?? '').subscribe({
      next: (res) => {
        this.u_round.update(r => r + 1);
        this.users.update(current => [...current, ...res.users]);
        this.u_more.set(res.more);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.log(err);
        this.searchErr.set("Error loading users");
      }
    })
  }

  onScrollUsers(event: Event) {
    if (this.loading() && !this.u_more()) return;

    const element = event.target as HTMLElement;
    const threshold = 10;
    const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

    if (load) {
      console.log('load');
      this.loadUsers();
    }
  }

  toggleOverlay() {
    this.overlay.update(o => !o);
    if (this.overlay()) {
      this.search.set('');
    }
    else {
      this.search.set(null);
    }
  }

  reloadMatches() {
    this.m_round.set(1);
    this.m_more.set(true);
    this.matches.set([]);
    this.loadMatches();
  }

  loadMatches() {
    if (this.loading() || !this.m_more()) return;

    this.loading.set(true);

    this.matchService.getAllMatches(this.m_round(), this.count, this.self()?.id!).subscribe({
      next: (res) => {
        this.m_round.update(r => r + 1);
        this.matches.update(current => [...current, ...res.matches]);
        this.m_more.set(res.more);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.log(err);
      }
    })
  }

  onScrollMatches(event: Event) {
    if (this.loading() || !this.m_more()) return;

    const element = event.target as HTMLElement;
    const threshold = 10;
    const load = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

    if (load) {
      console.log('load');
      this.loadMatches();
    }
  }

  onChall(id: string) {
    this.challangeService.sendInvite(id);
    this.challanged.update(list => [...list, id]);
    setTimeout(() => this.challanged.update(list => list.filter(el => el !== id)), 5000);
  }

  onPvP() {
    this.queueService.connect();
    this.toggleQueue();
  }

  onBot() {
    this.botService.canEnter.set(true);
    this.router.navigate(['/bot']);
    this.botService.canLeave.set(false);
  }

  leavePvP() {
    this.queueService.disconnect();
    this.toggleQueue();
  }

  toggleQueue() {
    this.showQueueScreen.update(o => !o);
  }

  showInfo(event: MouseEvent, user: User) {
    if (user === null) return;
    this.hovered.set(user);
    this.showingInfo.set(true);
    this.infoX.set(event.clientX + 10);
    this.infoY.set(event.clientY + 10);
  }

  hideInfo() {
    this.showingInfo.set(false);
  }

  isChallanged(id: string) {
    return this.challanged().findIndex(el => el === id) >= 0;
  }
}
