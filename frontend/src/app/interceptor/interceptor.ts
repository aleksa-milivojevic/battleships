import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, of, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class Interceptor implements HttpInterceptor {
    constructor(
        private inject: Injector,
        private router: Router
    ) {}

    counter = 0;

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authReq = req.clone({ withCredentials: true });
        throw next.handle(authReq).pipe(catchError(x => this.handleAuthError(x)));
    }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        if (err && err.status === 401 && this.counter != 1) {
            this.counter++;
            const service = this.inject.get(AuthService);
            service.refreshToken().subscribe({
                next: (res) => {
                    console.log(res);
                    return of("Tokens refreshed, try again");
                },
                error: (err) => {
                    service.logout().subscribe({
                        next: (res) => {
                            this.router.navigateByUrl('/login');
                            return of(err.message);
                        }
                    })
                }
            })
            return of("attempting to refresh tokens");
        }
        else {
            this.counter = 0;
            return throwError(() => new Error("Non Authenticated Error"));
        }
    }
}