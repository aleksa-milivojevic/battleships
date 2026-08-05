import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

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
        console.log("onlogin");
        console.log(this.form.value);
        if (this.form.invalid)  {
            this.errorMessage.set("invalid credentials");
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set("");

        this.authService.login(this.form.value).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/main']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err);
                this.form.get('password')?.setValue('');
            }
        });
    }
}
