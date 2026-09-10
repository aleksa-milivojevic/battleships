import { Injectable, inject, signal } from "@angular/core";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment.development";

export interface Report {
    id: string,
    reported: User | null,
    source: User | null,
    type: string,
    messages: string
}

export interface ReportedUser {
    user: User,
    reports: Report[];
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = `${environment.apiUrl}/report`;
    private http = inject(HttpClient);
    
    private _reportedUsers = signal<ReportedUser[]>([]);
    readonly reportedUsers = this._reportedUsers.asReadonly();

    getAll(round: number = 1, count: number = 10): Observable<{ users: ReportedUser[], more: boolean }> {
        const params = new HttpParams()
            .set('round', round.toString())
            .set('count', count.toString());

        return this.http.get<{ users: ReportedUser[], more: boolean }>(
            `${this.apiUrl}/get`,
            { params: params }
        ).pipe(
            tap(res => {
                if (round == 1) {
                    this._reportedUsers.set(res.users || [])
                } else {
                    this._reportedUsers.update(current => [...current, ...res.users || []])
                }
                console.log(res);
            })
        );
    }

    report(reported: string, source: string, type: string, messages: string): Observable<Report> {
        return this.http.post<Report>(
            `${this.apiUrl}/add`,
            { reported: reported, source: source, type: type, messages: messages }
        );
    }

    deleteOnes(id: string): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/del`,
            { body: { id: id } }
        ).pipe(
            tap(res => this._reports.update(list => list.filter(el => el.reported?.id !== id)))
        )
    }
}
