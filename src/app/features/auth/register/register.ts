import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router'
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsersService, CreateUserDto } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  //Declaramos variable vacia para despues usarla 
  registerForm!: FormGroup;
  imagenPreview: string | null = null;
  submitted = false;
  //Para validaciones del formulario
  currentStep = 1;
  totalSteps = 2;
  //Para la muestra de modales
  showSuccessModal = false;
  isLoading = false;
  errorMessage = "";

  // Opciones para los selectores
  months = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  //Generamos datos dinamicamente
  //Guion - Significa "no me interesa este parametro, asi que deja su lugar vacio"
  days = Array.from({ length: 31 }, (_, i) => i + 1); //Array.from --> Recibe 2 parametros (elemento, indice) e: seria el valor actual del array , i: numero de posicion de ese elemento
  years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  //Inyectamos los servicios que vamos a utilizar
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      //Paso 1: Datos Basicos
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      month: ['', Validators.required],
      day: ['', Validators.required],
      year: ['', Validators.required],

      //Paso 2: Datos de la Cuenta
      userName: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9._]+$')]],
      description: ['', Validators.maxLength(500)],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', Validators.required],
      profileImageUrl: [null],
      profile: ['usuario']
    }, {
      validators: this.passwordMatchValidator
    });
  }



  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('passwordConfirmation');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.registerForm.controls;
  }


  //Validamos si el paso 1 esta completo
  isStep1Valid(): boolean {
    const step1Fields = ['name', 'lastName', 'email', 'month', 'day', 'year'];
    return step1Fields.every(field => {
      const control = this.registerForm.get(field);
      console.log(field);
      console.log(control?.valid);
      return control && control.valid;
    });
  }

  isStep2Valid(): boolean {
    const step2RequiredFields = ['userName', 'password', 'passwordConfirmation'];
    const fieldsValid = step2RequiredFields.every(field => {
      const control = this.registerForm.get(field);
      return control && control.valid;
    });

    return fieldsValid && !this.registerForm.hasError('passwordMismatch');
  }






  // Navegar al siguiente paso
  nextStep(): void {
    if (this.currentStep === 1) {
      // Marcar campos del paso 1 como touched para mostrar errores
      ['name', 'lastName', 'email', 'month', 'day', 'year'].forEach(field => {
        this.registerForm.get(field)?.markAsTouched();
      });

      if (this.isStep1Valid()) {
        // Validar edad mínima antes de avanzar
        const fechaNacimiento = new Date(
          this.registerForm.value.year,
          this.registerForm.value.month - 1,
          this.registerForm.value.day
        );
        const edad = this.calcularEdad(fechaNacimiento);

        if (edad < 13) {
          alert('Debes tener al menos 13 años para registrarte');
          return;
        }

        this.currentStep = 2;
      }
    }
  }

  // Volver al paso anterior
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }


  // Manejo de la imagen de perfil
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        alert('Solo se permiten imágenes (JPG, PNG, GIF)');
        return;
      }

      // Validar tamaño (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }

      this.registerForm.patchValue({ profileImageUrl: file });

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Enviar formulario
  onSubmit(): void {
    console.log("Ejecutando onSubmit")
    this.submitted = true;
    this.errorMessage = "";

    // Marcar todos los campos del paso 2 como touched
    ['userName', 'description', 'password', 'passwordConfirmation'].forEach(field => {
      this.registerForm.get(field)?.markAsTouched();
    });

    if (!this.isStep2Valid()) {
      return;
    }

    if (this.registerForm.invalid) {
      return;
    }

    if (this.registerForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar edad mínima (13 años)
    const fechaNacimiento = new Date(
      this.registerForm.value.year,
      this.registerForm.value.month - 1,
      this.registerForm.value.day
    );
    const edad = this.calcularEdad(fechaNacimiento);

    if (edad < 13) {
      alert('Debes tener al menos 13 años para registrarte');
      return;
    }

    this.isLoading = true;

    // Aquí irían las llamadas a tu servicio de autenticación
    //preparamos campos del formulario
    const formData = new FormData();

    // Agregar campos del formulario
    formData.append('name', this.registerForm.value.name);
    formData.append('lastName', this.registerForm.value.lastName);
    formData.append('email', this.registerForm.value.email);
    formData.append('userName', this.registerForm.value.userName);
    formData.append('password', this.registerForm.value.password);
    formData.append('passwordConfirmation', this.registerForm.value.passwordConfirmation);
    const birthDateString = `${this.registerForm.value.year}-${String(this.registerForm.value.month).padStart(2, '0')}-${String(this.registerForm.value.day).padStart(2, '0')}`;
    formData.append('birthDate', birthDateString);

    if (this.registerForm.value.description) {
      formData.append('description', this.registerForm.value.description);
    }

    // Agregar archivo si existe
    if (this.registerForm.value.profileImageUrl) {
      formData.append('profileImageUrl', this.registerForm.value.profileImageUrl);
    }

    //Llamamos al servicio
    this.authService.register(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.openSuccessModal();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error en registro: ", error);

        // Manejar diferentes tipos de error del backend
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 409) {
          this.errorMessage = 'El correo electrónico ya está registrado';
        } else if (error.status === 400) {
          this.errorMessage = 'El nombre de usuario ya está en uso';
        } else {
          this.errorMessage = 'Error en el registro. Intenta nuevamente.';
        }
      }
    })

    this.router.navigate(["/login"])
  }

  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // Helper para verificar si un campo tiene error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.submitted));
  }

  // Helper para obtener mensaje de error
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || (!field.touched && !this.submitted)) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field.hasError('email')) {
      return 'Ingresa un correo válido';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `No debe superar los ${maxLength} caracteres`;
    }
    if (field.hasError('pattern')) {
      return 'Solo letras, números y guiones bajos';
    }

    return '';
  }

  getPasswordMismatchError(): string {
    if (this.registerForm.hasError('passwordMismatch') &&
      (this.registerForm.get('passwordConfirmation')?.touched || this.submitted)) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  openSuccessModal() {
    this.showSuccessModal = true;
    console.log('Registro exitoso, modal abierto');
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/login']); // redirección después de cerrar modal
  }
}
