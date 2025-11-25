import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService, UsuarioResponse } from '../services/auth.service';

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

        // -------------------------------
        // SI EL USUARIO ESTÁ AUTENTICADO
        // -------------------------------
        if (user) {

          // Si quiere entrar a /home o a /
          if (this.router.url === '/' || this.router.url === '/home') {
            console.log('[AuthGuard] Usuario logueado, redirigiendo a /publicaciones');
            return this.router.createUrlTree(['/publicaciones']);
          }

          // Lo dejamos pasar
          return true;
        }

        // -------------------------------
        // SI NO ESTÁ AUTENTICADO
        // -------------------------------
        console.log('[AuthGuard] Redirigiendo a /home');
        return this.router.createUrlTree(['/home']);
      }),
      catchError(() => {
        console.error('[AuthGuard] Error en authorize() → Redirigiendo a /home');
        return of(this.router.createUrlTree(['/home']));
      })
    );
  }
}
