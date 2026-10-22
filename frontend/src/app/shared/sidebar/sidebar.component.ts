import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translation = inject(TranslateService);
  private audioService = inject(AudioService);

  self = this.authService.user;

  showSettings = signal(false);

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.authService.clearCookies().subscribe({
          error: (err) => console.error(err)
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleLanguage() {
    const currentLanguage = this.translation.currentLang();
    if (currentLanguage === 'sr') {
      this.translation.use('en');
    }
    else {
      this.translation.use('sr');
    }
  }

  toggleSettings() {
    this.showSettings.update(o => !o);
  }

  toggleMusic() {
    this.audioService.toggleMusic();
  }

  toggleSFX() {
    this.audioService.toggleSFX();
  }
}