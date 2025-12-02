import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';
import { Publications } from './features/publications/publications';
import { PublicationCardComponent } from './publication-card/publication-card';
import { AuthGuard } from './core/guards/authGuard';


export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
    },
    {
        path: "publicaciones",
        loadComponent: () => import('./features/publications/publications').then(m => m.Publications),
        canActivate: [AuthGuard]
    },
    {
        path: "mi-perfil",
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
        canActivate: [AuthGuard]
    }, {
        path: 'perfil/:id',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
    },
    {
        path: "dashboard-user",
        loadComponent: () => import('./dashboard-user/dashboard-user').then(m => m.DashboardUser)
    },
    {
        path: "dashboard-stats",
        loadComponent: () => import('./dashboard-stats/dashboard-stats').then(m => m.DashboardStatsComponent)
    },
    {
        path: "publicacion",
        loadComponent: () => import('./publication-card/publication-card').then(m => m.PublicationCardComponent),
        canActivate: [AuthGuard]
    },
    {
        path: "publicacion/:id",
        loadComponent: () => import('./publication-detail/publication-detail').then(m => m.PublicationDetail),
        canActivate: [AuthGuard]
    },
    {
        path: '404',
        loadComponent: () => import('./not-found/not-found').then(m => m.NotFound)
    },

    { path: '**', redirectTo: '/404' }
];
