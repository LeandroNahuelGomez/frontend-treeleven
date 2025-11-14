import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';
import { Publications } from './features/publications/publications';


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
        loadComponent: () => import('./features/publications/publications').then(m => m.Publications)
    },
    {
        path: "mi-perfil",
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
    },
    {
        path: '404',
        loadComponent: () => import('./not-found/not-found').then(m => m.NotFound)
    },

    { path: '**', redirectTo: '/404' }
];
