import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, retry, switchMap, tap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (req.url.endsWith('/refresh')) {
        return next(req);
    }
    
    // return next(req).pipe(
    //     tap({
    //         error: (error: HttpErrorResponse) => {
    //             if ([401].includes(error.status)) {
    //                 authService.refreshToken().subscribe({
    //                     next: (res) => {
    //                         console.log(res);
    //                         return next(req);
    //                     },
    //                     error: (err) => {
    //                         console.error(err);
    //                         authService.clearLocal();
    //                         router.navigate(['/login']);
    //                         return;
    //                     }
    //                 });
    //             }
    //         }
    //     })
    // );

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {

            if (error.status !== 401) {
                return throwError(() => error);
            }

            return authService.refreshToken().pipe(
                switchMap((res) => {
                    console.log(res.message);
                    
                    return next(req);
                }),

                catchError((err) => {
                    console.error(err);

                    authService.clearLocal();
                    router.navigate(['/login']);

                    return throwError(() => err);
                })
            );
        })
    );
}