import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChallangeService } from './services/sockets/challange.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private challangeService = inject(ChallangeService);
  protected readonly title = signal('frontend');
}