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
  isLoading = signal(true);

  constructor(
    private authService: AuthService,
    public sessionService: SessionService
  ) {}

  ngOnInit(): void {

    // Solo para mostrar el spinner MIENTRAS authorize() resuelve la primera vez
    this.authService.authorize().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}