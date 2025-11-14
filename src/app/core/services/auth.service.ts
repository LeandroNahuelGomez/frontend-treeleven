import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, tap, catchError, throwError } from "rxjs";
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

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials, {
      withCredentials: true, //Envia y recibe cookies
    }).pipe(
      tap(res => console.log("Login Exitoso", res))
    )
  }

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

  getCurrentUser(): UsuarioResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }


}