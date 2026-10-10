import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';

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
  private translate = inject(TranslateService);

  protected readonly title = signal('frontend');

  constructor() {
    this.translate.use('en')
  }
}