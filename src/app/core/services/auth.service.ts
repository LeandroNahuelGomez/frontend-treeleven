import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, tap, map, catchError, throwError, of } from "rxjs";
import { Router } from "@angular/router";

export interface LoginCredentials {
  identificator: string;
  password: string;
}

export interface UsuarioResponse {
  _id: string;
  email: string;
  userName: string;
  name?: string;
  lastName?: string;
  profile: string;
  active: boolean;
  profileImageUrl?: string;
  createdAt: Date;
}

export interface LoginResponse {
  user: UsuarioResponse;
  expiresIn: string;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: UsuarioResponse;
  };
}

export interface AuthorizeResponse {
  success: boolean;
  message: string;
  data: {
    user: UsuarioResponse;
    valid: boolean;
  };
}


@Injectable({
  providedIn: "root"
})
export class AuthService {
  //Url del backend en render
  private readonly API_URL = 'https://backend-treeleven.onrender.com/api/auth'
  private currentUserSubject = new BehaviorSubject<UsuarioResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  //Login funcional - FUNCIONA TODO CORRECTAMENTE
  login(credentials: LoginCredentials): Observable<AuthorizeResponse> {
    return this.http.post<AuthorizeResponse>(`${this.API_URL}/login`, credentials, {
      withCredentials: true, //Envia y recibe cookies
    }).pipe(
      tap(res => {
        console.log("Login Exitoso", res)
        if (res.success && res.data.user) {
          this.currentUserSubject.next(res.data.user)
        }
      })
    )
  }


  //FUNCIONA CORRECTAMENTE
  register(formData: FormData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, formData, {
      withCredentials: true
    }).pipe(
      tap(res => {
        if (res.success && res.data.user) {
          this.currentUserSubject.next(res.data.user);
        }
      }),
      catchError(error => {
        console.error("register Error: ", error);
        return throwError(() => error);
      })
    )
  }


  //Funciona correctamente
  getCurrentUser(): UsuarioResponse | null {
    return this.currentUserSubject.value;
  }

  //Funciona correctamente
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }


  //AUTORIZAR COOKIE
  authorize(): Observable<UsuarioResponse | null> {
    return this.http.post<AuthorizeResponse>(`${this.API_URL}/autorizar`, {}, {
      withCredentials: true
    }).pipe(
      // 1. Mapeo (si el 200 OK fue exitoso y válido)
      map(res => (res && res.success && res.data && res.data.valid) ? res.data.user : null),

      // 2. Actualización de estado (tap se ejecuta en éxito o en el valor de catchError)
      tap((user: UsuarioResponse | null) => {
        console.log("El usuario es: ", user);
        this.currentUserSubject.next(user);
      }),

      // 3. Manejo de errores HTTP (401, 500, etc.)
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn("Error 401: Token inválido o expirado.");
        } else {
          console.error("Error de red/servidor al autorizar:", error);
        }

        // En caso de cualquier error (401 o 500), se asume que no hay sesión.
        this.currentUserSubject.next(null);
        return of(null); // <--- ESTO SOLUCIONA EL ERROR: retorna un Observable en todos los casos.
      })
    );
  }

  //Funciona correctamente
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.profile === 'administrador' || false;
  }

  // Agregar este método en auth.service.ts

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/refrescar`, {}, {
      withCredentials: true
    }).pipe(
      tap(res => {
        console.log('Token refrescado:', res);
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    console.log("Ejecutando logout")
    return this.http.post<any>(`${this.API_URL}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(res => {
        console.log("Respuesta logout: ", res)
        this.currentUserSubject.next(null);
      }),
      catchError(error => {
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }



}