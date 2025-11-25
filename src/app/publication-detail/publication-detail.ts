import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Publication } from '../shared/models/publication.model';
import { Comment } from '../shared/models/comment.model';
import { AuthService } from '../core/services/auth.service';
import { PublicationsService } from '../core/services/publications.service';
import { CommentsService } from '../core/services/comment.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-publication-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css',
})
export class PublicationDetail implements OnInit {
  publication = signal<Publication | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Comments
  comments = signal<Comment[]>([]);
  totalCommentsCount = signal(0);
  offset = signal(0);
  limit = 10;
  hasMore = signal(false);
  loadingComments = signal(false);

  // Nuevo comentario
  newComment = signal('');
  submittingComment = signal(false);

  // Edición
  editingId = signal<string | null>(null);
  editingText = signal('');

  private publicationId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private publicationsService: PublicationsService,
    private commentsService: CommentsService
  ) { }

  ngOnInit(): void {
    this.publicationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.publicationId) {
      this.loadPublication();
      this.loadComments();
    } else {
      this.error.set('ID de publicación no válido');
      this.loading.set(false);
    }
  }

  get currentUserId(): string | null {
    return this.authService.getCurrentUser()?._id ?? null;
  }

  get isMyPost(): boolean {
    const pub = this.publication();
    const currentUser = this.authService.getCurrentUser();
    return currentUser?._id === pub?.author._id;
  }

  get canDelete(): boolean {
    return this.isMyPost || this.authService.isAdmin();
  }

  // ========== PUBLICATION ==========

  loadPublication(): void {
    this.loading.set(true);
    this.publicationsService.getPublicationById(this.publicationId).subscribe({
      next: (res) => {
        this.publication.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando publicación:', err);
        this.error.set('No se pudo cargar la publicación');
        this.loading.set(false);
      }
    });
  }

  toggleLike(): void {
    const pub = this.publication();
    if (!pub) return;

    console.log('userLiked actual:', pub.userLiked); // <-- Agregá esto

    // Si ya le dio like, quitarlo. Si no, darlo.
    const request$ = pub.userLiked
      ? this.publicationsService.removeLike(pub._id)
      : this.publicationsService.giveLike(pub._id);

    request$.subscribe({
      next: (res) => {
        console.log("Respuesta: ", res)
        this.publication.set({
          ...pub,
          userLiked: !pub.userLiked,
          numberLikes: pub.userLiked ? pub.numberLikes - 1 : pub.numberLikes + 1
        });
      },
      error: (err) => console.error('Error toggle like:', err)
    });
  }

  deletePost(): void {
    const pub = this.publication();
    if (!pub || !confirm('¿Eliminar esta publicación?')) return;

    this.publicationsService.deletePublication(pub._id).subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: (err) => console.error('Error eliminando:', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/publicaciones']);
  }

  // ========== COMMENTS ==========

  loadComments(): void {
    this.loadingComments.set(true);

    this.commentsService.getComments(this.publicationId, this.offset(), this.limit).subscribe({
      next: (res) => {
        this.comments.set(res.data.comments);
        this.totalCommentsCount.set(res.data.pagination.total);
        this.hasMore.set(res.data.pagination.hasMore);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Error cargando comentarios:', err);
        this.loadingComments.set(false);
      }
    });
  }

  loadMoreComments(): void {
    if (!this.hasMore() || this.loadingComments()) return;

    this.loadingComments.set(true);
    const newOffset = this.offset() + this.limit;

    this.commentsService.getComments(this.publicationId, newOffset, this.limit).subscribe({
      next: (res) => {
        this.comments.update(c => [...c, ...res.data.comments]);
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

  submitComment(): void {
    const message = this.newComment().trim();
    if (!message || this.submittingComment()) return;

    this.submittingComment.set(true);

    this.commentsService.createComment(this.publicationId, { message }).subscribe({
      next: (res) => {
        this.comments.update(c => [res.data, ...c]);
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

    this.commentsService.updateComment(this.publicationId, commentId, { message }).subscribe({
      next: (res) => {
        this.comments.update(c => c.map(x => x._id === commentId ? res.data : x));
        this.cancelEditing();
      },
      error: (err) => console.error('Error editando comentario:', err)
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('¿Eliminar este comentario?')) return;

    this.commentsService.deleteComment(this.publicationId, commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(x => x._id !== commentId));
        this.totalCommentsCount.update(n => n - 1);
      },
      error: (err) => console.error('Error eliminando comentario:', err)
    });
  }

  canEditComment(comment: Comment): boolean {
    return this.currentUserId === comment.author._id;
  }

  canDeleteComment(comment: Comment): boolean {
    return this.currentUserId === comment.author._id || this.authService.isAdmin();
  }

  // Helpers
  updateNewComment(e: Event): void {
    this.newComment.set((e.target as HTMLTextAreaElement).value);
  }

  updateEditingText(e: Event): void {
    this.editingText.set((e.target as HTMLTextAreaElement).value);
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    if (hrs < 24) return `Hace ${hrs}h`;
    if (days < 7) return `Hace ${days}d`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
