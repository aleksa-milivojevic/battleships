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
    password = signal('');
    newPassword = signal('');
    newPassword2 = signal('');
    showChPassScreen = signal(false);

    validUsername = computed(() => {
        return this.newUsername().length >= 3
    })

    validPass = computed(() => {
        return this.password().length >= 5 && 
        this.newPassword().length >= 5 && 
        this.newPassword2().length >= 5 &&
        this.newPassword() === this.newPassword2();
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

    onChPass(): void {
        if (!this.validPass) return;

        this.loading.set(true);

        this.userService.changePassword(this.self()?.id!, this.password(), this.newPassword()).subscribe({
            next: (res) => {
                console.log(res.user);
                this.loading.set(false);
                this.toggleChPassScreen();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.errorMessage.set('serverska greska');
            }
        })
    }

    toggleChPassScreen() {
        this.showChPassScreen.update(o => !o);
    }
}