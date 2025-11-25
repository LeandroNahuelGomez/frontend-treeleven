import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    showSessionModal = signal(false);
    timeLeft = signal(0); // En segundos

    private warningTimer!: any;
    private expirationTimer!: any;
    private countdownInterval!: any;

    // private readonly WARNING_TIME = 10 * 60; // 10 min
    // private readonly EXPIRATION_TIME = 15 * 60; // 15 min

    //Variables para debugging
    private readonly WARNING_TIME = 10 * 60;  // 10 segundos
    private readonly EXPIRATION_TIME = 15 * 60; // 15 segundos


    constructor(private auth: AuthService) { }

    // Arranca los timers de la sesión
    startSessionTimers() {
        this.clearTimers();

        // ⏳ A los 10 min → mostrar modal
        this.warningTimer = setTimeout(() => {
            this.openModal();
        }, this.WARNING_TIME * 1000);

        // ⛔ A los 15 min → logout automático
        this.expirationTimer = setTimeout(() => {
            this.forceLogout();
        }, this.EXPIRATION_TIME * 1000);
    }

    // Abre el modal y arranca cuenta regresiva real
    private openModal() {
        this.showSessionModal.set(true);
        this.startCountdown(this.EXPIRATION_TIME - this.WARNING_TIME);
    }

    // Cuenta regresiva en segundos
    private startCountdown(seconds: number) {
        this.timeLeft.set(seconds);

        this.countdownInterval = setInterval(() => {
            const newVal = this.timeLeft() - 1;
            this.timeLeft.set(newVal);

            if (newVal <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    extendSession() {
        this.showSessionModal.set(false);
        clearInterval(this.countdownInterval);

        this.auth.refreshToken().subscribe(() => {
            this.startSessionTimers();
        });
    }

    forceLogout() {
        this.showSessionModal.set(false);
        this.clearTimers();

        this.auth.logout().subscribe(() => {
            window.location.href = '/login';
        });
    }

    clearTimers() {
        clearTimeout(this.warningTimer);
        clearTimeout(this.expirationTimer);
        clearInterval(this.countdownInterval);
    }

    // SessionService
    remainingMs(): number {
        return this.timeLeft() * 1000; // convertir segundos a milisegundos
    }

}
