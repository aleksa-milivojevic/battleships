import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    console.log("auth interceptor");
    console.log(req.headers);

    const authReq = req.clone({ withCredentials: true });
    return next(authReq);
}