import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Loading } from './loading/loading';
import { CommonModule } from '@angular/common';
import { SessionService } from './core/services/session.service';
import { SessionModalComponent } from './session-modal/session-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading, CommonModule, SessionModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-treeleven');
  isLoading = signal(true); // ⬅️ IMPORTANTE

  constructor(
    private authService: AuthService,
    private router: Router,
    public sessionService: SessionService
  ) { }

  ngOnInit(): void {
    // Verificamos sesión 1 vez al iniciar la app
    this.verifySession();
  }

  private verifySession() {
    // authorize() debe devolver un observable que COMPLETE (HTTP)
    // y en next/error actualizamos isLoading. No hacemos navegación aquí.
    this.authService.authorize().subscribe({
      next: (res) => {
        // opcional: manejar estado del usuario en authService si lo necesitas
        this.isLoading.set(false);
      },
      error: (err) => {
        // si hay error (no autenticado) igualmente ocultamos el loading
        this.isLoading.set(false);
      }
    });
  }
}
