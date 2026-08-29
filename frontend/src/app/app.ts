import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChallangeService } from './services/sockets/challange.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private storageService = inject(StorageService);
  
  protected readonly title = signal('frontend');

  constructor() {
    this.storageService.removeAll();
  }
}