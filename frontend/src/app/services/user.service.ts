import { Injectable, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

export interface User {
    id: string,
    email: string,
    username: string,
    score: number,
    admin: boolean,
    online: boolean,
    createdAt: Date
}

export interface LoginRequest {
    email: string,
    password: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/user`
    private http = inject(HttpClient);
    
    private _users = signal<User[]>([]);
    readonly users = this._users.asReadonly();

    private updateUserInList(updatedUser: User): void {
        this._users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser: u));
    }
    
    login(credentials: LoginRequest): Observable<{user: User}> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/setonline`,
            { credentials },
            { withCredentials: true }
        ).pipe(
            tap(res => this.updateUserInList(res.user))
        );
    }
}