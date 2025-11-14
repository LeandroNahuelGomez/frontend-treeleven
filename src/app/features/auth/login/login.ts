import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  currentStep = 1;
  totalSteps = 1;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, this.passwordValidator]]
    });
  }

  /** 🔹 Manejador del submit del formulario */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const loginData = {
      identificator: this.loginForm.value.identificador,
      password: this.loginForm.value.contrasena
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login exitoso:', response);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);

        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
        }
      }
    });
  }

  /** 🔹 Validación personalizada de contraseña */
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);

    const errors: any = {};
    if (!hasMinLength) errors.minlength = true;
    if (!hasUpperCase) errors.upperCase = true;
    if (!hasNumber) errors.number = true;

    return Object.keys(errors).length ? errors : null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.submitted));
  }

  getIdentificadorErrorMessage(): string {
    const field = this.loginForm.get('identificador');
    if (!field || (!field.touched && !this.submitted)) return '';
    if (field.hasError('required')) return 'Este campo es obligatorio';
    if (field.hasError('minlength')) return 'Debe tener al menos 3 caracteres';
    return '';
  }

  getPasswordErrorMessage(): string {
    const field = this.loginForm.get('contrasena');
    if (!field || (!field.touched && !this.submitted)) return '';
    if (field.hasError('required')) return 'La contraseña es obligatoria';

    const errors = [];
    if (field.hasError('minlength')) errors.push('8 caracteres');
    if (field.hasError('upperCase')) errors.push('1 mayúscula');
    if (field.hasError('number')) errors.push('1 número');

    return errors.length > 0 ? `Debe contener al menos: ${errors.join(', ')}` : '';
  }
}
