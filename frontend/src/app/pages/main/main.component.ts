import { Component, HostListener, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from "@angular/forms";
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  private userService = inject(UserService);
  
  readonly count = 10;

  overlay = signal(false);
  search = signal('');
  round = signal(1);
  more = signal(true);
  loading = signal(false);
  searchErr = signal('');

  users = signal<User[]>([]);

  constructor() {
    effect(() => {
      this.search();

      untracked(() => {
        this.reload()
      });
    });
  }

  ngOnInit(): void {}

  reload() {
    this.round.set(1);
    this.more.set(true);
    this.users.set([]);
    this.loadUsers();
  }

  loadUsers() {
    if (this.loading() || !this.more()) return;

    this.loading.set(true);
    console.log(`search: ${this.search()}`);

    this.userService.getAllUsers(this.round(), this.count,  this.search()).subscribe({
      next: (res) => {
        this.round.update(r => r + 1);
        this.users.update(current => [...current, ...res.users]);
        this.more.set(res.more);
        this.loading.set(false);
        console.log(res.users);
      },
      error: (err) => {
        this.loading.set(false);
        console.log(err);
        this.searchErr.set("Error loading users");
      }
    })
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const threshold = 150;
    const currentPosition = window.innerHeight + window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;

    if (currentPosition >= scrollHeight - threshold) {
      this.loadUsers();
    }
  }

  toggleOverlay() {
    this.overlay.update(o => !o);
    if (this.overlay()) this.loadUsers();
  }
}
