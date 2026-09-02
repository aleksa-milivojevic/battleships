import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/log-in/log-in.component';
import { MainComponent } from './pages/main/main.component';
import { SigninComponent } from './pages/signin/sign-in.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AnonGuard, UserGuard } from './guards/auth.guard';
import { ChallangesComponent } from './pages/challanges/challanges.component';
import { GameComponent } from './pages/game/game.component';
import { BotGameComponent } from './pages/bot-game/bot-game.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [AnonGuard]},
    { path: 'login', component: LoginComponent, canActivate: [AnonGuard]},
    { path: 'signin', component: SigninComponent, canActivate: [AnonGuard]},
    { path: 'main', component: MainComponent, canActivate: [UserGuard]},
    { path: 'leaderboard', component: LeaderboardComponent, canActivate: [UserGuard]},
    { path: 'profile', component: ProfileComponent, canActivate: [UserGuard]},
    { path: 'challanges', component: ChallangesComponent, canActivate: [UserGuard] },
    { path: 'game', component: GameComponent, canActivate: [UserGuard] },
    { path: 'bot', component: BotGameComponent, canActivate: [UserGuard] },
    { path: '**', redirectTo: 'home' }
];
