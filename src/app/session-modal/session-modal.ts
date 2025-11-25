import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../core/services/session.service';
import { Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-session-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="session.showSessionModal()">
      <div class="modal-content">

        <div class="modal-icon">⏰</div>
        <h2>Tu sesión está por expirar</h2>

        <p>Tiempo restante: <strong>{{ remainingText() }}</strong></p>

        <p>¿Deseas extender tu sesión?</p>
        
        <div class="modal-actions">
          <button class="btn-extend" (click)="extend.emit()">
            Sí, extender sesión
          </button>
          <button class="btn-logout" (click)="logout.emit()">
            No, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h2 {
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    p {
      color: #6b7280;
      margin: 0.5rem 0;
    }

    p strong {
      color: #ef4444;
      font-size: 1.2rem;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .btn-extend {
      padding: 0.875rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-extend:hover {
      background: #2563eb;
    }

    .btn-logout {
      padding: 0.875rem 1.5rem;
      background: transparent;
      color: #6b7280;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: #f3f4f6;
      color: #374151;
    }
  `]
})
export class SessionModalComponent{
  @Output() extend = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();


  //Computamos el texto directamente desde la señal timeLeft
  remainingText = computed(() => {
    const seconds = this.session.timeLeft();
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  })


  constructor(public session: SessionService) { }

}