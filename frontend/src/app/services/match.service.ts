import { Injectable, inject, signal } from "@angular/core";
import { User } from "./user.service";
import { Observable, tap } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment.development";

export interface Match {
    id: string,
    winner: User,
    looser: User,
    points: number,
    createdAt: Date
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private apiUrl = `${environment.apiUrl}/match`;
    private http = inject(HttpClient);
    
    private _matches = signal<Match[]>([]);
    readonly matches = this._matches.asReadonly();

    getAllMatches(round: number = 1, count: number = 10, userId: string): Observable<{ matches: Match[], more: boolean }> {
        const params = new HttpParams()
            .set('round', round.toString())
            .set('count', count.toString())
            .set('user', userId);

        return this.http.get<{ matches: Match[], more: boolean }>(
            `${this.apiUrl}/getall`,
            { params: params, withCredentials: true }
        ).pipe(
            tap(res => {
                if (round == 1) {
                    this._matches.set(res.matches || [])
                } else {
                    this._matches.update(current => [...current, ...res.matches || []])
                }
                console.log(res);
            })
        );
    }

    saveMatch(winner: string, looser: string, points: number): Observable<Match> {
        return this.http.post<Match>(
            `${this.apiUrl}/add`,
            { winner: winner, looser: looser, points: points },
            { withCredentials: true }
        );
    }
}
