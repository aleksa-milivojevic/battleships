import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";

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
    private router = inject(Router);

    self = this.authService.user;

    newUsername = signal('');
    loading = signal(false);
    errorMessage = signal('');
    showChNameScreen = signal(false);
    password = signal('');
    newPassword = signal('');
    newPassword2 = signal('');
    showChPassScreen = signal(false);
    showDelScreen = signal(false);
    delPassword = signal('');

    validUsername = computed(() => {
        return this.newUsername().length >= 3
    })

    validPass = computed(() => {
        return this.password().length >= 5 && 
        this.newPassword().length >= 5 && 
        this.newPassword2().length >= 5 &&
        this.newPassword() === this.newPassword2();
    })

    validDel = computed(() => {
        return this.delPassword().length >= 5;
    })

    ngOnInit(): void {}

    onChName(): void {
        if (!this.validUsername()) return;

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
        this.errorMessage.set('');
        this.newUsername.set('');
    }

    onChPass(): void {
        if (!this.validPass()) return;

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
        this.errorMessage.set('');
        this.password.set('');
        this.newPassword.set('');
        this.newPassword2.set('');
    }

    onDel(): void {
        if (!this.validDel()) return;

        this.loading.set(true);

        this.userService.deleteAccount(this.self()?.id!, this.delPassword()).subscribe({
            next: () => {
                this.router.navigate(['/home']);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set(err.message);
                this.loading.set(false);
            }
        })
    }

    toggleDelScreen() {
        this.showDelScreen.update(o => !o);
        this.errorMessage.set('');
        this.delPassword.set('');
    }
}