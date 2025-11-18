import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publication } from '../shared/models/publication.model';
import { EmailValidator } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publication-card.html',
  styleUrls: ['./publication-card.css']
})
export class PublicationCardComponent {
  @Input() publication!: Publication;
  @Output() likeToggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();


  constructor(
    private authService: AuthService
  ) { }


  get isMyPost(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?._id === this.publication.author._id;
  }

  get canDelete(): boolean {
    return this.isMyPost || this.authService.isAdmin();
  }


  toggleLike(): void {
    this.likeToggle.emit(this.publication._id);
  }

  deletePost(): void {
    this.delete.emit(this.publication._id);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return postDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }


}