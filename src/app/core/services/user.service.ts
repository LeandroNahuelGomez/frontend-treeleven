import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProfileData } from "../../features/profile/profile";

export interface User {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  userName: string;
  birthDate: Date;
  description?: string;
  profileImageUrl?: string;
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

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
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
  // getAllUsers(): Observable<User[]> {
  //   return this.http.get<User[]>(this.apiUrl);
  // }

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

  getMyProfile(): Observable<{ success: boolean; data: ProfileData }> {
    return this.http.get<{ success: boolean; data: ProfileData }>(`${this.apiUrl}/profile`,
      { withCredentials: true }
    )
  }

  // Actualizar perfil (datos y opcionalmente imagen)
  updateMyProfile(updateData: UpdateUserDto, profileImage?: File): Observable<any> {
    const formData = new FormData();

    // Agregamos los datos del DTO
    Object.keys(updateData).forEach(key => {
      const value = updateData[key as keyof UpdateUserDto];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregamos imagen si existe
    if (profileImage) {
      formData.append('profile-image', profileImage);
    }

    return this.http.put<any>(`${this.apiUrl}/profile`, formData);
  }

  // ========== ENDPOINTS DE ADMINISTRADOR ==========

  /**
   * Listar todos los usuarios (incluidos deshabilitados)
   * Solo para administradores
   */
  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}/admin/list`, {withCredentials: true});
  }

  /**
   * Crear usuario como administrador
   * FormData debe incluir: name, lastName, email, userName, password,
   * birthDate, description, role, profilePicture (opcional)
   */
  createUserByAdmin(formData: FormData): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/admin/create`,
      formData,
      {withCredentials: true}
    );
  }

  /**
   * Deshabilitar usuario (baja lógica)
   */
  disableUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/admin/disable/${userId}`,
      {withCredentials: true}
    );
  }

  /**
   * Habilitar usuario (alta lógica)
   */
  enableUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/admin/enable/${userId}`,
      {},
      {withCredentials: true}
    );
  }

  /**
   * Toggle rol usuario/administrador
   */
  toggleUserRole(userId: string): Observable<{ message: string; data: { newRole: string } }> {
    return this.http.post<{ message: string; data: { newRole: string } }>(
      `${this.apiUrl}/admin/toggle-role/${userId}`,
      {},
      { withCredentials: true }
    );
  }



}
