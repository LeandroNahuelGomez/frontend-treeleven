import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

export interface User {
    _id?: string;
    name: string;
    lastName: string;
    email: string;
    userName: string;
    birthDate: Date;
    description?: string;
    profilePictureUrl?: string;
    cloudinaryPublicId?: string;
    profile?: string;
    active?: boolean;
}

export interface CreateUserDto {
  name: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  birthDate: Date;
  description?: string;
  profilePictureUrl?: string;
  profile?: string;
  active?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  password?: string;
  birthDate?: Date;
  description?: string;
  profile?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'https://backend-treeleven.onrender.com/api/users';

  constructor(private http: HttpClient) { }

  // Crear usuario con imagen de perfil
  createUser(userData: CreateUserDto, profilePicture?: File): Observable<User> {
    const formData = new FormData();
    
    // Agregar datos del usuario
    Object.keys(userData).forEach(key => {
      const value = userData[key as keyof CreateUserDto];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregar imagen si existe
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    return this.http.post<User>(this.apiUrl, formData);
  }

  // Subir/Actualizar imagen de perfil
  uploadProfileImage(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('profile', file);

    return this.http.post<User>(`${this.apiUrl}/upload-profileImg`, formData);
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Buscar usuario por email o username
  findByIdentificator(identificator: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/find?identificator=${identificator}`);
  }

  // Buscar por email
  findByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email?email=${email}`);
  }

  // Buscar por username
  findByUsername(userName: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username?userName=${userName}`);
  }

  // Buscar por ID
  findById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Actualizar usuario
  updateUser(id: string, updateData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, updateData);
  }

  // Eliminar usuario
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
