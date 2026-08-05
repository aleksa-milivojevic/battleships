import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SigninComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    form: FormGroup;
    isLoading = signal(false);
    errorMessage = signal("");

    constructor() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(5)]],
            password2: ['', [Validators.required, Validators.minLength(5)]]
        });
    }

    onSignin(): void {
        console.log(this.form.value);
        if (this.form.invalid)  {
            this.errorMessage.set("invalid credentials");
            return;
        }

        if (this.form.get('password')?.value !== this.form.get('password2')?.value) {
            this.errorMessage.set("passwords must match");
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set("");

        this.authService.signin(this.form.value).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/main']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err);
                this.form.get('password')?.setValue('');
                this.form.get('password2')?.setValue('');
            }
        });
    }
}
