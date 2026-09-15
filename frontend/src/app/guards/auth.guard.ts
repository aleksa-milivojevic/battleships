import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { GameService } from "../services/sockets/game.service";
import { BotService } from "../services/bot.service";

export const AnonGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) return true;

    return router.navigate(['/main']);
}

export const UserGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const gameService = inject(GameService);
    const botService = inject(BotService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) return router.navigate(['/home']);

    if (!gameService.canLeave()) return router.navigate(['/game']);

    if (!botService.canLeave()) return router.navigate(['/bot']);

    return true;
}

export const AdminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const gameService = inject(GameService);
    const botService = inject(BotService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) return router.navigate(['/home']);

    if (!gameService.canLeave()) return router.navigate(['/game']);

    if (!botService.canLeave()) return router.navigate(['/bot']);

    if (authService.isAdmin()) return true;

    return router.navigate(['/main']);
}

export const GameGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const gameService = inject(GameService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) return router.navigate(['/home']);

    if (gameService.canEnter()) return true;
    
    return router.navigate(['/main']);
}

export const BotGameGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const botService = inject(BotService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) return router.navigate(['/home']);

    if (botService.canEnter()) return true;
    
    return router.navigate(['/main']);
}