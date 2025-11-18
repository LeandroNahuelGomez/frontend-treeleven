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
    return this.http.get<AuthorizeResponse>(`${this.API_URL}/autorizar`, {
      withCredentials: true
    }).pipe(
      // transform AuthorizeResponse into UsuarioResponse | null
      map(res => (res && res.success && res.data && res.data.valid) ? res.data.user : null),
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.currentUserSubject.next(null);
        }
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      }),
      tap(() => console.log("Sesion verificada: " + this.currentUserSubject.value))
    )
  }

  //Funciona correctamente
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.profile === 'administrador' || false;
  }



}