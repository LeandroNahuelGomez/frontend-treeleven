import { Component, signal } from '@angular/core';
import { RouterOutlet, Router} from '@angular/router';
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
export class App {
  
  protected readonly title = signal('frontend-treeleven');
  isLoading = signal(true); // ⬅️ IMPORTANTE

  constructor(
    private authService: AuthService,
    private router: Router,
    public sessionService: SessionService
  ) {
    this.verifySession();
  }

  verifySession() {
    //Solo llamamos al servicio y desactiva el loading
    //El servicio se encarga de actualizar el estado de autenticacion
    this.authService.authorize().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    })

  }
}
