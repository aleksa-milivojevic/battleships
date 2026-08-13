import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/log-in/log-in.component';
import { MainComponent } from './pages/main/main.component';
import { SigninComponent } from './pages/signin/sign-in.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signin', component: SigninComponent },
    { path: 'main', component: MainComponent, canActivate: [UserGuard]},
    { path: 'leaderboard', component: LeaderboardComponent, canActivate: [UserGuard]},
    { path: 'profile', component: ProfileComponent, canActivate: [UserGuard]},
    { path: '**', redirectTo: 'home' }
];
