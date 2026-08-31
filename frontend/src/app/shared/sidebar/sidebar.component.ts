import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
}