import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private userService = inject(UserService);

    self = this.authService.user;

    newUsername = signal('');
    loading = signal(false);
    errorMessage = signal('');
    showChNameScreen = signal(false);

    validUsername = computed(() => {
        return this.newUsername().length >= 3
    })

    ngOnInit(): void {}

    onChName(): void {
        if (!this.validUsername) return;

        this.loading.set(true);

        this.userService.changeUsername(this.self()?.id!, this.newUsername()).subscribe({
            next: (res) => {
                console.log(res.user);
                this.loading.set(false);
                this.toggleChNameScreen();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.errorMessage.set('Serverska greska');
            }
        });
    }

    toggleChNameScreen() {
        this.showChNameScreen.update(v => !v);
    }
}