import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      //Comprobamos si el error es 401 (no autorizado/ Token Expirado)
      if (
        error.status === 401 &&
        !req.url.includes('/login') &&
        !req.url.includes('/register')
      ) {

        console.warn('Interceptor 401: Sesión no autorizada/expirada. Redirigiendo a /login.');

        // 1. Limpia el estado del usuario en el frontend
        authService.clearUserSession();

        // 2. Redirige al LOGIN
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
