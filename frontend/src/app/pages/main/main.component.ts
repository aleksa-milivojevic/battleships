import { Component, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from "@angular/forms";
import { User, UserService } from '../../services/user.service';
import { Match, MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  private userService = inject(UserService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);

  self = this.authService.user;
  
  readonly count = 10;

  overlay = signal(false);
  search = signal('');
  u_round = signal(1);
  u_more = signal(true);
  loading = signal(false);
  searchErr = signal('');

  m_round = signal(1);
  m_more = signal(true);

  users = signal<User[]>([]);

  matches = signal<Match[]>([]);

  constructor() {
    effect(() => {
      this.search();

      untracked(() => {
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
    if (this.loading() || !this.u_more()) return;

    this.loading.set(true);

    this.userService.getAllUsers(this.u_round(), this.count,  this.search()).subscribe({
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
    if (this.overlay()) this.loadUsers();
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

    this.matchService.getAllMatches(this.m_round(), this.count).subscribe({
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
}
