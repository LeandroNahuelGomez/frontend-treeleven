import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
// export class SessionService {

//     showSessionModal = signal(false);
//     timeLeft = signal(0); // En segundos

//     private warningTimer!: any;
//     private expirationTimer!: any;
//     private countdownInterval!: any;

//     private readonly WARNING_TIME = 10 * 60; // 10 min
//     private readonly EXPIRATION_TIME = 15 * 60; // 15 min

//     //Variables para debugging
//     // private readonly WARNING_TIME = 20;  // 20 segundos
//     // private readonly EXPIRATION_TIME = 30; // 30 segundos

//     constructor(private auth: AuthService) { }

//     // Arranca los timers de la sesión
//     startSessionTimers() {
//         this.clearTimers();

//         // ⏳ A los 10 min → mostrar modal
//         this.warningTimer = setTimeout(() => {
//             this.openModal();
//         }, this.WARNING_TIME * 1000);

//         // ⛔ A los 15 min → logout automático
//         this.expirationTimer = setTimeout(() => {
//             this.forceLogout();
//         }, this.EXPIRATION_TIME * 1000);
//     }

//     // Abre el modal y arranca cuenta regresiva real
//     private openModal() {
//         this.showSessionModal.set(true);
//         this.startCountdown(this.EXPIRATION_TIME - this.WARNING_TIME);
//     }

//     // Cuenta regresiva en segundos
//     private startCountdown(seconds: number) {
//         this.timeLeft.set(seconds);

//         this.countdownInterval = setInterval(() => {
//             const newVal = this.timeLeft() - 1;
//             this.timeLeft.set(newVal);

//             if (newVal <= 0) {
//                 clearInterval(this.countdownInterval);
//             }
//         }, 1000);
//     }

//     extendSession() {
//         this.showSessionModal.set(false);
//         clearInterval(this.countdownInterval);

//         this.auth.refreshToken().subscribe(() => {
//             this.startSessionTimers();
//         });
//     }

//     forceLogout() {
//         this.showSessionModal.set(false);
//         this.clearTimers();

//         this.auth.logout().subscribe(() => {
//             window.location.href = '/login';
//         });
//     }

//     clearTimers() {
//         clearTimeout(this.warningTimer);
//         clearTimeout(this.expirationTimer);
//         clearInterval(this.countdownInterval);
//     }

//     // SessionService
//     remainingMs(): number {
//         return this.timeLeft() * 1000; // convertir segundos a milisegundos
//     }

// }
export class SessionService {

    showSessionModal = signal(false);
    timeLeft = signal(0); // En segundos (cuenta regresiva del modal)

    private sessionActive: boolean = true;

    // 🚩 CONTROL DE MODO DE DEPURACIÓN
    // Cambia a 'true' para usar tiempos cortos de 30s / 20s.
    // Cambia a 'false' para usar tiempos de Producción (15m / 10m).
    private isDebugging: boolean = true;

    // Constantes de Producción (15 min / 10 min de advertencia)
    private readonly PROD_WARNING_TIME = 10 * 60; // 10 min
    private readonly PROD_EXPIRATION_TIME = 15 * 60; // 15 min

    // Constantes de Depuración (Ej: 30 segundos / 20 segundos de advertencia)
    private readonly DEBUG_WARNING_TIME = 20; // 20 segundos
    private readonly DEBUG_EXPIRATION_TIME = 30; // 30 segundos

    // Variables que obtienen el valor en base a isDebugging
    private WARNING_TIME = this.isDebugging ? this.DEBUG_WARNING_TIME : this.PROD_WARNING_TIME;
    private EXPIRATION_TIME = this.isDebugging ? this.DEBUG_EXPIRATION_TIME : this.PROD_EXPIRATION_TIME;

    private warningTimer!: any;
    private expirationTimer!: any;
    private countdownInterval!: any;

    constructor(private auth: AuthService) { }

    /**
     * Permite cambiar el modo de depuración y recalcular los tiempos.
     * @param debugMode Si es 'true', usa tiempos cortos de 30s/20s.
     */
    public setDebugMode(debugMode: boolean): void {
        if (this.isDebugging !== debugMode) {
            this.isDebugging = debugMode;
            this.WARNING_TIME = this.isDebugging ? this.DEBUG_WARNING_TIME : this.PROD_WARNING_TIME;
            this.EXPIRATION_TIME = this.isDebugging ? this.DEBUG_EXPIRATION_TIME : this.PROD_EXPIRATION_TIME;
            console.warn(`[Session Debug] Modo de depuración: ${debugMode ? 'ACTIVADO' : 'DESACTIVADO'}. Expira en ${this.EXPIRATION_TIME}s.`);
        }
    }


    // Arranca los timers de la sesión
    startSessionTimers() {
        this.sessionActive = true;
        this.clearTimers();

        const warningDelay = this.WARNING_TIME * 1000;
        const expirationDelay = this.EXPIRATION_TIME * 1000;

        console.log(`[Session Timer] Sesión iniciada. Total: ${this.EXPIRATION_TIME}s. Advertencia en: ${this.WARNING_TIME}s.`);

        // ⏳ A los 10 min (o 20s en debug) → mostrar modal
        this.warningTimer = setTimeout(() => {
            if (!this.sessionActive) return; // <-- no abrir modal si la sesión terminó
            console.warn(`[Session Timer] 🚨 ADVERTENCIA: Llamando a openModal después de ${this.WARNING_TIME}s.`);
            this.openModal();
        }, warningDelay);

        // ⛔ A los 15 min (o 30s en debug) → logout automático
        this.expirationTimer = setTimeout(() => {
            console.error(`[Session Timer] ❌ EXPIRACIÓN: Llamando a forceLogout después de ${this.EXPIRATION_TIME}s.`);
            this.forceLogout();
        }, expirationDelay);
    }

    // Abre el modal y arranca cuenta regresiva real
    private openModal() {
        if (!this.sessionActive) return; // <-- protección extra
        const countdownTime = this.EXPIRATION_TIME - this.WARNING_TIME;
        this.showSessionModal.set(true);
        console.log(`[Session Countdown] Iniciando cuenta regresiva del modal: ${countdownTime} segundos.`);
        this.startCountdown(countdownTime);
    }

    // Cuenta regresiva en segundos (solo para el modal)
    private startCountdown(seconds: number) {
        this.timeLeft.set(seconds);

        this.countdownInterval = setInterval(() => {
            const newVal = this.timeLeft() - 1;
            this.timeLeft.set(newVal);

            if (newVal <= 0) {
                clearInterval(this.countdownInterval);
                console.log('[Session Countdown] Cuenta regresiva del modal finalizada.');
            } else {
                // Puedes loguear la cuenta regresiva del modal aquí si quieres más detalle en la consola
                // console.log(`[Modal Remaining] ${newVal}s`);
            }
        }, 1000);
    }

    extendSession() {
        this.showSessionModal.set(false);
        clearInterval(this.countdownInterval);

        console.log('[Session Action] Extendiendo sesión...');
        this.auth.refreshToken().subscribe(() => {
            console.log('[Session Action] Token refrescado. Reiniciando timers.');
            this.startSessionTimers();
        });
    }

    forceLogout() {
        if (!this.sessionActive) return; // <-- protección extra
        this.showSessionModal.set(false);
        this.clearTimers();

        // 2️⃣ Limpiar estado local del usuario (para que la app reaccione inmediatamente)
        this.auth.clearUserSession();

        console.log('[Session Action] Cerrando sesión forzosamente...');
        this.auth.logout().subscribe(() => {
            // En un entorno real de Angular con routing, esto sería router.navigate(['/login']);
            // Mantenemos window.location.href solo para simulación o si no usas router.
            console.log('[Session Action] Redirigiendo a /login.');
            // window.location.href = '/login'; 
        });
    }

    clearTimers() {
        clearTimeout(this.warningTimer);
        clearTimeout(this.expirationTimer);
        clearInterval(this.countdownInterval);
        console.log('[Session Timer] Todos los timers limpiados.');
    }

    // SessionService
    remainingMs(): number {
        return this.timeLeft() * 1000; // convertir segundos a milisegundos
    }

}