import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, retry, tap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    let shouldKickOut = false;
    
    return next(req).pipe(
        // retry({ count: 2, delay: 1000 }),
        tap({
            error: (error: HttpErrorResponse) => {
                if ([401].includes(error.status)) {
                    console.log("401 interceptor");
                    if (shouldKickOut) {
                        shouldKickOut = false;
                        authService.clearLocal();
                        router.navigate(['/login']);
                        return;
                    }

                    shouldKickOut = true;
                    authService.refreshToken();
                }
            }
        })
    );
}