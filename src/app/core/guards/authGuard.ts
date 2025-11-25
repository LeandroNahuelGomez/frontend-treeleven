import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService, UsuarioResponse } from '../services/auth.service'; // Asumiendo esta ruta

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

canActivate(): Observable<boolean | UrlTree> {
  console.log('[AuthGuard] Verificando sesión del usuario...');

  return this.auth.authorize().pipe(
    tap((user: UsuarioResponse | null) => {
      if (user) {
        console.log('[AuthGuard] Usuario autenticado:', user);
      } else {
        console.warn('[AuthGuard] Usuario no autenticado.');
      }
    }),
    map(user => {
      if (user) return true;
      console.log('[AuthGuard] Redirigiendo a /home');
      return this.router.createUrlTree(['/home']);
    })
  );
}


}