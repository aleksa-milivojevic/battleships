import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, retry, tap, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    console.log("error interceptor");
    return next(req).pipe(
        retry({ count: 2, delay: 1000 }),
        tap({
            error: (error: HttpErrorResponse) => {
                // error side efects
                if ([500, 404].includes(error.status)) {
                    //specificno za 500 i 404 ili sa vise interceptora
                }
            }
        })
    );
}