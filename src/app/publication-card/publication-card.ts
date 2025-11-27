import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publication } from '../shared/models/publication.model';
import { EmailValidator } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { PublicationsService } from '../core/services/publications.service';
import { signal, computed } from '@angular/core';
import { CommentsService } from '../core/services/comment.service';
import { flush } from '@angular/core/testing';
import { Comment } from '../shared/models/comment.model';
import { Router } from '@angular/router';
import { TimeAgoPipe } from '../core/pipes/time-ago-pipe';

export interface CommentAuthor {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  profileImageUrl?: string;
}

export interface CommentResponse {
  _id: string;
  message: string;
  author: CommentAuthor;
  createdAt: string;
  edited?: boolean;
  editedAt?: Date;
}

@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './publication-card.html',
  styleUrls: ['./publication-card.css']
})
export class PublicationCardComponent {
  @Input() publication!: Publication;
  @Output() likeToggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  comments = signal<Comment[]>([]);
  totalCommentsCount = signal(0)
  // pagination
  offset = signal(0);
  limit = 5;
  hasMore = signal(false);
  loadingComments = signal(false);

  //Nuevo comentario
  newComment = signal('');
  submittingComment = signal(false);

  // edición
  editingId = signal<string | null>(null);
  editingText = signal('');

  showComments = signal(false);


  constructor(
    private authService: AuthService,
    private publicationsService: PublicationsService,
    private commentsService: CommentsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadComments()
  }

  get currentUserId(): string | null {
    return this.authService.getCurrentUser()?._id ?? null;
  }


  get isMyPost(): boolean {
    const currentUser = this.authService.getCurrentUser();
    console.log("El usuario actual es:" ,currentUser)
    return currentUser?._id === this.publication.author._id;
  }

  get canDelete(): boolean {
    console.log("El id es:", this.publication._id)
    console.log("Es mi post? ", this.isMyPost)
    console.log("Es admin?", this.authService.isAdmin())
    return this.isMyPost || this.authService.isAdmin();
  }

  viewDetail(): void {
  this.router.navigate(['/publicacion', this.publication._id]);
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

  toggleComments(): void {
    this.showComments.update(v => !v);
    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.loadingComments.set(true);

    this.commentsService.getComments(
      this.publication._id,
      this.offset(),
      this.limit
    ).subscribe({
      next: (res) => {
        this.comments.set(res.data.comments);
        this.totalCommentsCount.set(res.data.pagination.total);
        this.hasMore.set(res.data.pagination.hasMore);
        this.loadingComments.set(false)
      },
      error: (err) => {
        console.error("Error cargando comentarios: ", err);
        this.loadingComments.set(false);
      }
    })
  }

  loadMoreComments(): void {
    if (!this.hasMore() || this.loadingComments()) return;

    this.loadingComments.set(true);
    const newOffset = this.offset() + this.limit;

    this.commentsService.getComments(
      this.publication._id,
      newOffset,
      this.limit
    ).subscribe({
      next: (res) => {
        this.comments.update(current => [...current, ...res.data.comments]);
        this.offset.set(newOffset);
        this.hasMore.set(res.data.pagination.hasMore);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Error cargando más comentarios:', err);
        this.loadingComments.set(false);
      }
    });
  }

  // Crear comentario
  submitComment(): void {
    const message = this.newComment().trim();
    if (!message || this.submittingComment()) return;

    this.submittingComment.set(true);

    this.commentsService.createComment(this.publication._id, { message }).subscribe({
      next: (res) => {
        // Agregar al inicio de la lista
        this.comments.update(current => [res.data, ...current]);
        this.totalCommentsCount.update(n => n + 1);
        this.newComment.set('');
        this.submittingComment.set(false);
      },
      error: (err) => {
        console.error('Error creando comentario:', err);
        this.submittingComment.set(false);
      }
    });
  }

  // Edición
  startEditing(comment: Comment): void {
    this.editingId.set(comment._id);
    this.editingText.set(comment.message);
  }

  cancelEditing(): void {
    this.editingId.set(null);
    this.editingText.set('');
  }

  saveEdit(): void {
    const commentId = this.editingId();
    const message = this.editingText().trim();
    if (!commentId || !message) return;

    this.commentsService.updateComment(
      this.publication._id,
      commentId,
      { message }
    ).subscribe({
      next: (res) => {
        this.comments.update(current =>
          current.map(c => c._id === commentId ? res.data : c)
        );
        this.cancelEditing();
      },
      error: (err) => {
        console.error('Error editando comentario:', err);
      }
    });
  }

  // Eliminar
  deleteComment(commentId: string): void {
    if (!confirm('¿Eliminar este comentario?')) return;

    this.commentsService.deleteComment(this.publication._id, commentId).subscribe({
      next: () => {
        this.comments.update(current => current.filter(c => c._id !== commentId));
        this.totalCommentsCount.update(n => n - 1);
      },
      error: (err) => {
        console.error('Error eliminando comentario:', err);
      }
    });
  }

  canEditComment(comment: Comment): boolean {
    return this.currentUserId === comment.author._id;
  }

  canDeleteComment(comment: Comment): boolean {
    return this.currentUserId === comment.author._id || this.authService.isAdmin();
  }

  // Helpers
  updateNewComment(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.newComment.set(input.value);
  }

  updateEditingText(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.editingText.set(input.value);
  }





}