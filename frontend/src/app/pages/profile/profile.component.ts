import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [SidebarComponent, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private router = inject(Router);

    private readonly emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    self = this.authService.user;

    newUsername = signal(this.self()?.username ?? '');
    newEmail = signal(this.self()?.email ?? '');
    loading = signal(false);
    errorMessage = signal('');
    showChNameScreen = signal(false);
    password = signal('');
    newPassword = signal('');
    newPassword2 = signal('');
    showChPassScreen = signal(false);
    showChEmailScreen = signal(false);
    showDelScreen = signal(false);
    delPassword = signal('');

    isHovered = signal<boolean>(false);
    imagePreview = signal<string | ArrayBuffer | null>(null);
    file = signal<File | null>(null);
    showUpdatePicture = signal(false);
    updatePictureValid = computed(() => this.file() !== null);

    validUsername = computed(() => {
        return this.newUsername().length >= 3
    })

    validEmail = computed(() => {
        return String(this.newEmail())
            .toLowerCase()
            .match(this.emailRegex);
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
                this.errorMessage.set(err.message ?? 'Sorry, an error has occured. Try again in a bit.');
            }
        });
    }

    onChEmail(): void {
        if (!this.validEmail()) return;

        this.loading.set(true);

        this.userService.changeEmail(this.self()?.id!, this.newEmail()).subscribe({
            next: (res) => {
                console.log(res.user);
                this.loading.set(false);
                this.toggleChNameScreen();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.errorMessage.set(err.message ?? 'Sorry, an error has occured. Try again in a bit.');
            }
        });
    }

    toggleChNameScreen() {
        this.showChNameScreen.update(v => !v);
        this.errorMessage.set('');
        this.newUsername.set('');
    }

    toggleChEmailScreen() {
        this.showChEmailScreen.update(v => !v);
        this.errorMessage.set('');
        this.newEmail.set('');
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

    toggleUpdatePicture() {
        this.showUpdatePicture.update(o => !o);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.isHovered.set(true);
    }

    onDragLeave() {
        this.isHovered.set(false);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.isHovered.set(false);

        const files = event.dataTransfer?.files;
        if (files && files.length > 0)
            this.handleFile(files[0]);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
        }
    }
    
    handleFile(file: File) {
        if (!file.type.startsWith('image/')) {
            alert('Dozvoljene su samo slike!');
            return;
        }

        this.file.set(file);

        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview.set(reader.result);
        };
        reader.readAsDataURL(file);
    }

    onUpdatePicture() {
        if (this.loading() || !this.updatePictureValid()) return;

        this.loading.set(true);

        this.userService.updatePicture(this.file()!).subscribe({
            next: () => {
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                console.error(err);
                this.errorMessage.set(err.message);
            }
        });
    }

    getCreatedAt() {
        const date = this.self()?.createdAt
                        .toString()
                        .slice(0, 10)
                        .split('-');
        if (!date) return null;
        return date[2] + '.' + date[1] + '.' + date[0] + ".";
    }
}