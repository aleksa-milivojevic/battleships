import { Injectable, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";
import { StorageService } from "./storage.service";
import { withIncrementalHydration } from "@angular/platform-browser";
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

interface AuthResponse {
    accessToken: string,
    refreshToken: string,
    user: User
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

    // private _accessToken = signal<string | null>(this.storage.getItem<string>('ACCESS_TOKEN'));
    // private _refreshToken = signal<string | null>(this.storage.getItem<string>('REFRESH_TOKEN'));

    constructor() {
        // this.storage.setItem('SELF', this._user);
        // this.storage.setItem('ACCESS_TOKEN', this._accessToken);
    }

    private handleAuthResponse(response: AuthResponse): void {
        this._user.set(response.user);
        this.storage.setItem('SELF', this._user());

        this.cookies.set("accessToken", response.accessToken);
        this.cookies.set("refreshToken", response.refreshToken);

        // this._accessToken.set(response.accessToken);
        // this._refreshToken.set(response.refreshToken);

        // this.storage.setItem('ACCESS_TOKEN', this._accessToken());
        // this.storage.setItem('REFRESH_TOKEN', this._refreshToken());
    }
    
    login(credentials: LoginRequest): Observable<AuthResponse> {
        console.log("ulazi u login");
        return this.http.post<AuthResponse>(
            `${this.apiUrl}/login`,
            { email: credentials.email, password: credentials.password },
            { withCredentials: true }
        ).pipe(
            tap(res => this.handleAuthResponse(res))
        );
    }

    signin(credentials: SigninRequest): Observable<{user: User}> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/signin`,
            { email: credentials.email, username: credentials.username, password: credentials.password },
            { withCredentials: true }
        )
    }

    refreshToken(): Observable<{ accessToken: string, refreshToken: string}> {
        return this.http.get<{ accessToken: string, refreshToken: string }>(
            `${this.apiUrl}/refresh`,
            { withCredentials: true }
        ).pipe(
            tap(res => {
                this.cookies.set("accessToken", res.accessToken);
                this.cookies.set("refreshToken", res.refreshToken);
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/logout`,
            { withCredentials: true }
        ).
    }

    updateSelf(updatedSelf: User) {
        this._user.set(updatedSelf);
        this.storage.setItem('SELF', updatedSelf);
    }
}