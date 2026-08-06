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

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/user`;
    private http = inject(HttpClient);
    
    private _users = signal<User[]>([]);
    readonly users = this._users.asReadonly();

    selectedUser = signal<User | null>(null);

    private updateList(updatedUser: User) {
        this._users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (this.selectedUser()?.id === updatedUser.id) {
            this.selectedUser.set(updatedUser);
        }
    }

    getAllUsers(): Observable<{ users: User[] }> {
        return this.http.get<{ users: User[] }>(
            `${this.apiUrl}/getall`,
            { withCredentials: true }
        ).pipe(
            tap(res => this._users.set(res.users || []))
        );
    }
}