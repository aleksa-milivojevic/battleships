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

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private apiUrl = `${environment.apiUrl}/report`;
    private http = inject(HttpClient);
    
    private _reports = signal<Report[]>([]);
    readonly reports = this._reports.asReadonly();

    getAllMatches(round: number = 1, count: number = 10, userId: string): Observable<{ reports: Report[], more: boolean }> {
        const params = new HttpParams()
            .set('round', round.toString())
            .set('count', count.toString())
            .set('user', userId);

        return this.http.get<{ reports: Report[], more: boolean }>(
            `${this.apiUrl}/get`,
            { params: params }
        ).pipe(
            tap(res => {
                if (round == 1) {
                    this._reports.set(res.reports || [])
                } else {
                    this._reports.update(current => [...current, ...res.reports || []])
                }
                console.log(res);
            })
        );
    }

    report(reported: string, source: string, type: number, messages: string): Observable<Report> {
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
