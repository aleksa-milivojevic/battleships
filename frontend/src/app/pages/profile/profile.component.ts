import { Component, OnInit, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { User } from "../../services/user.service";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    
    self = signal<User | null>(null);

    ngOnInit(): void {
        this.self.set(this.authService.user());
    }


}