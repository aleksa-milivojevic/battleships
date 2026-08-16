import { Injectable, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { AuthService } from "./auth.service";

export interface User {
    id: string,
    email: string,
    username: string,
    score: number,
    admin: boolean,
    online: boolean,
    createdAt: Date
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/user`;
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    
    private _users = signal<User[]>([]);
    readonly users = this._users.asReadonly();

    selectedUser = signal<User | null>(null);

    private updateList(updatedUser: User) {
        console.log(updatedUser);
        this._users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (this.selectedUser()?.id === updatedUser.id) {
            this.selectedUser.set(updatedUser);
        }
    }

    getAllUsers(id: string, round: number = 1, count: number = 10, search: string = ''): Observable<{ users: User[], more: boolean }> {
        const params = new HttpParams()
            .set('id', id)
            .set('round', round.toString())
            .set('count', count.toString())
            .set('search', search);

        return this.http.get<{ users: User[], more: boolean }>(
            `${this.apiUrl}/getall`,
            { params: params, withCredentials: true }
        ).pipe(
            tap(res => {
                if (round == 1) {
                    this._users.set(res.users || [])
                } else {
                    this._users.update(current => [...current, ...res.users || []])
                }
                console.log(res);
            })
        );
    }

    changeUsername(id: string, username: string): Observable<{ user: User }> {
        return this.http.post<{user: User}>(
            `${this.apiUrl}/chname`,
            { id: id, username: username },
            { withCredentials: true }
        ).pipe(
            tap(res => this.updateList(res.user))
        ).pipe(
            tap(res => this.authService.updateSelf(res.user))
        )
    }

    changePassword(id: string, password: string, newPassword: string): Observable<{ user: User }> {
        return this.http.post<{ user: User }>(
            `${this.apiUrl}/chpass`,
            { id: id, password: password, newPassword: newPassword },
            { withCredentials: true }
        ).pipe(
            tap(res => this.updateList(res.user))
        ).pipe(
            tap(res => this.authService.updateSelf(res.user))
        )
    }

    deleteAccount(id: string, password: string): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/delete`,
            { withCredentials: true, body: { id: id, password: password } }
        ).pipe(
            tap(() => this.authService.clearLocal())
        );
    }
}