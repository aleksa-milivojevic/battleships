import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/log-in/log-in.component';
import { MainComponent } from './pages/main/main.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'main', component: MainComponent },
    { path: '**', redirectTo: 'home' }
];
