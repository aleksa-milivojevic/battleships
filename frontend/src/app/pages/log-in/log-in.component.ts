import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);

    form: FormGroup;
    isLoading = signal(false);
    errorMessage = signal("");

    constructor() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(3)]]
        });
    }

    onLogin(): void {
        if (this.form.invalid) return;

        this.isLoading.set(true);
        this.errorMessage.set("");

        this.userService.login(this.form.value).subscribe({
            next: () => {
                this.isLoading.set(false);
                //navigacija
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err);
                this.form.get('password')?.setValue('');
            }
        });
    }
}
