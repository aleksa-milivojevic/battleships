import { Injectable, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";

interface LoginRequest {
    email: string,
    password: string
}

interface SigninRequest {
    email: string,
    username: string,
    password: string
}

interface AuthResponse {
    accessToken: string,
    user: User
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`
    private http = inject(HttpClient);
    
    private _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();

    private _accessToken = signal<string>("");

    private handleAuthResponse(response: AuthResponse): void {
        this._user.set(response.user);

        this._accessToken.set(response.accessToken);
    }
    
    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/login`,
            { credentials },
            { withCredentials: true }
        ).pipe(
            tap(res => this.handleAuthResponse(res))
        );
    }

    signin(credentials: SigninRequest): Observable<{user: User}> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/signin`,
            { credentials },
            { withCredentials: true }
        )
    }
}