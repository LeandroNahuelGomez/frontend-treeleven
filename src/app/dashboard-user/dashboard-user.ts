import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../core/services/user.service';
import { Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../shared/navbar/navbar';
import { CleanTextPipe } from '../core/pipes/clean-text-pipe-pipe';
import { AutoFocusDirective } from '../core/directives/auto-focus-directive';

export interface UserListItem {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  profileImageUrl?: string;
  profile: string;
  active: boolean;
  birthDate: Date;
}

export interface User {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  profileImageUrl?: string;
  profile: string;
  active: boolean;
  birthDate: Date;
}


@Component({
  selector: 'app-dashboard-user',
  imports: [CommonModule, ReactiveFormsModule, Navbar, CleanTextPipe],
  templateUrl: './dashboardPrueba.html',
  styleUrl: './dashboardPrueba.css',
})
export class DashboardUser implements OnInit {
  //Signals
  users = signal<UserListItem[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showCreateModal = signal(false);

  // Formulario
  userForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    // Verificar que sea administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/publicaciones']);
      return;
    }

    this.loadUsers();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      repeatPassword: ['', Validators.required],
      birthDate: ['', Validators.required],
      description: [''],
      profile: ['usuario', Validators.required] // Radio button
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const repeatPassword = form.get('repeatPassword');

    if (password && repeatPassword && password.value !== repeatPassword.value) {
      repeatPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }


  // ========== CRUD OPERATIONS ==========
  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        const mappedUsers: UserListItem[] = res.data.map(user => ({
          _id: user._id!,
          name: user.name,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          profileImageUrl: user.profileImageUrl ?? '',
          profile: (user.profile as 'usuario' | 'administrador') ?? 'usuario',
          active: user.active ?? true,
          birthDate: user.birthDate
        }));

        this.users.set(mappedUsers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.error.set('No se pudo cargar la lista de usuarios');
        this.isLoading.set(false);
      }
    });
  }


  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.userForm.reset({ profile: 'usuario' });
    this.selectedFile = null;
    this.previewUrl = null;
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.userForm.reset({ profile: 'usuario' });
    this.selectedFile = null;
    this.previewUrl = null;
    this.successMessage.set(null);
    this.error.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpg|jpeg|png|webp)/)) {
        this.error.set('Solo se permiten imágenes (jpg, jpeg, png, webp)');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('La imagen no puede superar los 5MB');
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      this.error.set(null);
    }
  }

  submitForm(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = new FormData();

    // Agregar campos del formulario
    Object.keys(this.userForm.value).forEach(key => {
      if (key !== 'repeatPassword') { // No enviar repeatPassword
        formData.append(key, this.userForm.value[key]);
      }
    });

    // Agregar imagen si existe
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.usersService.createUserByAdmin(formData).subscribe({
      next: (res) => {
        this.successMessage.set('Usuario creado exitosamente');
        this.isSubmitting.set(false);

        // Recargar lista y cerrar modal
        setTimeout(() => {
          this.loadUsers();
          this.closeCreateModal();
        }, 1500);
      },
      error: (err) => {
        console.error('Error creando usuario:', err);
        this.error.set(err.error?.message || 'Error al crear el usuario');
        this.isSubmitting.set(false);
      }
    });
  }

  // Toggle activar/desactivar usuario
  toggleUserStatus(user: UserListItem): void {
    const action = user.active ? 'deshabilitar' : 'habilitar';
    const confirmMessage = user.active
      ? `¿Deshabilitar a ${user.name} ${user.lastName}? No podrá acceder a la aplicación.`
      : `¿Habilitar a ${user.name} ${user.lastName}?`;

    if (!confirm(confirmMessage)) return;

    const request = user.active
      ? this.usersService.disableUser(user._id)
      : this.usersService.enableUser(user._id);

    request.subscribe({
      next: (res) => {
        this.successMessage.set(res.message);

        // Actualizar estado local
        this.users.update(users =>
          users.map(u =>
            u._id === user._id
              ? { ...u, active: !u.active }
              : u
          )
        );

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error(`Error al ${action} usuario:`, err);
        this.error.set(err.error?.message || `No se pudo ${action} el usuario`);
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  // Toggle rol usuario/administrador
  toggleUserRole(user: UserListItem): void {
    const newRole = user.profile === 'usuario' ? 'administrador' : 'usuario';

    if (!confirm(`¿Cambiar rol de ${user.name} a ${newRole}?`)) return;

    this.usersService.toggleUserRole(user._id).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);

        // Actualizar estado local
        this.users.update(users =>
          users.map(u =>
            u._id === user._id
              ? { ...u, profile: res.data.newRole as 'usuario' | 'administrador' }
              : u
          )
        );

        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Error al cambiar rol:', err);
        this.error.set(err.error?.message || 'No se pudo cambiar el rol');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  // ========== HELPERS ==========

  getFieldError(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);

    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['pattern'] && fieldName === 'password') {
      return 'Debe contener al menos una mayúscula y un número';
    }
    if (field.errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'administrador' ? 'badge-admin' : 'badge-user';
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'badge-active' : 'badge-inactive';
  }
}