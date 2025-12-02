import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { AutoFocusDirective } from '../../../core/directives/auto-focus-directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AutoFocusDirective],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  currentStep = 1;
  totalSteps = 1;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificator: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, this.passwordValidator]]
    });
  }

  /** 🔹 Manejador del submit del formulario */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set('');

    if (this.loginForm.invalid) return;

    this.isLoading.set(true);

    const loginData = {
      identificator: this.loginForm.value.identificator,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.errorMessage.set("");
        this.isLoading.set(false);
        console.log('Login exitoso:', response);
        this.sessionService.startSessionTimers();
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.log("Probando con status ", error.status)
        console.log(this.isLoading)

        if (error.error?.message) {
          console.log(error.error.message)
          this.errorMessage.set(error.error.message);
        }

        else if (error.status === 401) {
          console.log(error.status)
          this.errorMessage.set('Credenciales incorrectas');
        }

        else if (error.status === 0) {
          this.errorMessage.set('No se puede conectar con el servidor.');
        }

        else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
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

  getIdentificatorErrorMessage(): string {
    const field = this.loginForm.get('identificator');
    if (!field || (!field.touched && !this.submitted)) return '';
    if (field.hasError('required')) return 'Este campo es obligatorio';
    if (field.hasError('minlength')) return 'Debe tener al menos 3 caracteres';
    return '';
  }

  getPasswordErrorMessage(): string {
    const field = this.loginForm.get('password');
    if (!field || (!field.touched && !this.submitted)) return '';
    if (field.hasError('required')) return 'La contraseña es obligatoria';

    const errors = [];
    if (field.hasError('minlength')) errors.push('8 caracteres');
    if (field.hasError('upperCase')) errors.push('1 mayúscula');
    if (field.hasError('number')) errors.push('1 número');

    return errors.length > 0 ? `Debe contener al menos: ${errors.join(', ')}` : '';
  }
}
