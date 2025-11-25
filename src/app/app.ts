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

  verifySession() {
    this.authService.authorize().subscribe({
      next: (user) => {
        this.isLoading.set(false);

        if (user) {
          // ⬅️ SOLO redirige si ESTÁS EN /home o en la raíz
          if (this.router.url === '/' || this.router.url === '/home') {
            this.router.navigate(['/publicaciones']);
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        // no navegamos, el guard se encarga
      }
    });
  }

}
