import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private storage = inject(StorageService);

  banned = signal(false);
  timeout = signal<number | null>(null);
  expiration = signal(new Date());

  constructor() {
    this.banned.set(this.storage.getItem('BAN') ?? false);
    this.timeout.set(this.storage.getItem('TIMEOUT') ?? null);

    if (this.banned()) {
      this.storage.removeItem('BAN');
    }

    if (this.timeout()) {
      this.storage.removeItem('TIMEOUT');
      this.expiration.update(date => {
        let copy = new Date(date);
        copy.setHours(copy.getHours() + this.timeout()! * 24);
        return copy;
      })
    }
  }
}
