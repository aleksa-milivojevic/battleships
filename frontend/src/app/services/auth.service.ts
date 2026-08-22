import { Injectable, OnDestroy, PLATFORM_ID, computed, effect, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";
import { StorageService } from "./storage.service";
import { isPlatformBrowser } from "@angular/common";
import { ChallangeService } from "./sockets/challange.service";

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
export class AuthService implements OnDestroy {
    private apiUrl = `${environment.apiUrl}/auth`
    private http = inject(HttpClient);
    private storage = inject(StorageService);
    private challangeService = inject(ChallangeService);

    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    private refreshTimer?: any;
    
    private _user = signal<User | null>(this.storage.getItem<User>('SELF'));
    readonly user = this._user.asReadonly();

    isAuthenticated = computed(() => !!this._user());
    isAdmin = computed(() => this._user()?.admin);

    constructor() {
        effect(() => {
            this._user();
            if (this._user()?.online) {
                this.challangeService.connect();
            }
        })
    }

    ngOnDestroy(): void {
        this.stopRefreshTimer();
    }

    private handleAuthResponse(user: User): void {
        this._user.set(user);
        this.storage.setItem('SELF', this._user());
        this.challangeService.updateSelf(user.id);
        this.startRefreshTimer();
        console.log(this._user());
    }
    
    login(credentials: LoginRequest): Observable<{ user: User }> {
        return this.http.post<{ user: User }>(
            `${this.apiUrl}/login`,
            { email: credentials.email, password: credentials.password }
        ).pipe(
            tap(res => this.handleAuthResponse(res.user))
        ).pipe(
            tap(res => {
                    // this.challangeService.listen();
                    this.setOnline().subscribe();
                }
            )
        );
    }

    signin(credentials: SigninRequest): Observable<{user: User}> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/signin`,
            { email: credentials.email, username: credentials.username, password: credentials.password }
        ).pipe(
            tap(res => this.handleAuthResponse(res.user))
        )
    }

    refreshToken(): Observable<{ message: string }> {
        console.log("refreshing tokens");
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/refresh`,
            {}
        );
    }

    logout(): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/logout`,
            {}
        ).pipe(
            tap(() => this.clearLocal())
        ).pipe(
            tap(() => {
                    this.challangeService.disconnect();
                }
            )
        );
    }

    updateSelf(updatedSelf: User) {
        this._user.set(updatedSelf);
        this.storage.setItem('SELF', updatedSelf);
    }

    clearLocal() {
        this.stopRefreshTimer();
        this.storage.removeItem('SELF');
        this._user.set(null);
    }

    private startRefreshTimer() {
        this.stopRefreshTimer();
        if (!this.isBrowser) return;

        const timespan_milis = 59 * 60 * 1000;
        this.refreshTimer = setInterval(() => {
            this.refreshToken().subscribe({
                error: () => this.clearLocal()
            });
        }, timespan_milis);
    }

    private stopRefreshTimer() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }

    setOnline(): Observable<any> {
        console.log(this._user());
        return this.http.post<any>(
            `${environment.apiUrl}/user/online`,
            { id: this._user()?.id }
        ).pipe(
            tap(() => {
                const uu = ({ ...this._user()!, online: true });
                console.log("NOVI USER");
                console.log(uu);
                this.updateSelf(uu);
            })
        )
    }
}