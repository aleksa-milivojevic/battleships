import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  
  protected readonly title = signal('frontend');

  constructor() {
    this.storageService.removeAll();
    this.authService.clearCookies().subscribe({
      error: (err) => console.error(err)
    });
  }
}