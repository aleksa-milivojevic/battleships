import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private translate = inject(TranslateService);
  private audio = inject(AudioService);

  protected readonly title = signal('frontend');

  constructor() {
    this.translate.use('en')
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const element = target.closest('button, .button-sfx');

    if (!element) return;

    if (
      element instanceof HTMLButtonElement &&
      element.disabled
    ) {
      return;
    }

    this.audio.playButtonSound();
  }

  // @HostListener('document:pointerover', ['$event'])
  // onDocumentPointerOver(event: PointerEvent) {
  //   const target = event.target as HTMLElement;
  //   const element = target.closest('button, .button-sfx');

  //   if (!element) return;

  //   if (
  //     element instanceof HTMLButtonElement &&
  //     element.disabled
  //   ) {
  //     return;
  //   }

  //   if (
  //     event.relatedTarget instanceof Node &&
  //     element.contains(event.relatedTarget)
  //   ) {
  //     return;
  //   }

  //   this.audio.playButtonSound();
  // }
}