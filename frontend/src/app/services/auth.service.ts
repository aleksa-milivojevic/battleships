import { Injectable, computed, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";
import { StorageService } from "./storage.service";
import { CookieService } from "ngx-cookie-service";

interface LoginRequest {
    email: string,
    password: string
}

interface SigninRequest {
    email: string,
    username: string,
    password: string
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`
    private http = inject(HttpClient);
    private storage = inject(StorageService);
    private cookies = inject(CookieService);    
    
    private _user = signal<User | null>(this.storage.getItem<User>('SELF'));
    readonly user = this._user.asReadonly();

    isAuthenticated = computed(() => !!this._user());
    isAdmin = computed(() => this._user()?.admin);

    constructor() {
        this.storage.setItem('SELF', this._user);
    }

    private handleAuthResponse(user: User): void {
        this._user.set(user);
        this.storage.setItem('SELF', this._user());
    }
    
    login(credentials: LoginRequest): Observable<{ user: User }> {
        return this.http.post<{ user: User }>(
            `${this.apiUrl}/login`,
            { email: credentials.email, password: credentials.password },
            { withCredentials: true }
        ).pipe(
            tap(res => this.handleAuthResponse(res.user))
        );
    }

    signin(credentials: SigninRequest): Observable<{user: User}> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/signin`,
            { email: credentials.email, username: credentials.username, password: credentials.password },
            { withCredentials: true }
        ).pipe(
            tap(res => this.handleAuthResponse(res.user))
        )
    }

    refreshToken(): Observable<{ message: string }> {
        return this.http.get<{ message: string }>(
            `${this.apiUrl}/refresh`,
            { withCredentials: true }
        ).pipe(
            tap(res => {
                console.log(res.message);
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/logout`,
            { withCredentials: true }
        ).pipe(
            tap(() => this.storage.removeItem("SELF"))
        );
    }

    updateSelf(updatedSelf: User) {
        this._user.set(updatedSelf);
        this.storage.setItem('SELF', updatedSelf);
    }

    clearStorage() {
        this.storage.removeItem('SELF');
    }
}