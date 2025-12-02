import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicationCardComponent } from '../../publication-card/publication-card';
import { User, UsersService } from '../../core/services/user.service';
import { PublicationsService } from '../../core/services/publications.service';
import { Publication, PublicationsResponse } from '../../shared/models/publication.model';

export interface ProfileData {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  description: string;
  profileImageUrl: string;
  birthDate: string;
  lastPublications: Publication[];
  profile: string;
}

interface PostAuthor {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  profileImageUrl?: string;
}


@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar, PublicationCardComponent],
  templateUrl: './profile.html',
  styleUrl: './pruebaProfile.css',
})

export class Profile implements OnInit {
  user = signal<ProfileData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private userService: UsersService,
    private publicationsService: PublicationsService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getMyProfile().subscribe({
      next: (res) => {
        this.user.set(res.data)
        console.log("Las publicaciones son: ", res.data.lastPublications)
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el perfil.');
        this.isLoading.set(false);
        console.error(err);
      }
    })
  }

  // toggleUserRole(): void {
  //   const userId = this.user()?._id;
  //   console.log("El id del usuario es: ", userId)
  //   if (!userId) {
  //     alert("No se pudo identificar al usuario");
  //     return
  //   }
  //   this.userService.toggleUserRole(userId).subscribe({
  //     next: (res) => {
  //       console.log("ROL ACTUALIZADO", res.data.newRole)
  //       this.user.update(current => {
  //         if (!current) return current;
  //         return {
  //           ...current,
  //           profile: res.data.newRole as "usuario" | "administrador"
  //         }
  //       });
  //       alert(`Rol cambiado a: ${res.data.newRole}`);
  //     },
  //     error: (err) => {
  //       console.error('❌ Error al cambiar el rol:', err);
  //       alert('No se pudo cambiar el rol del usuario');
  //     }
  //   })
  // }


  // Manejar like/unlike
  
  handleLikeToggle(publicationId: string): void {
    const publications = this.user()?.lastPublications;
    if (!publications) return;

    const publication = publications.find(p => p._id === publicationId);
    if (!publication) return;

    const action = publication.userLiked
      ? this.publicationsService.removeLike(publicationId)
      : this.publicationsService.giveLike(publicationId);

    action.subscribe({
      next: () => {
        // Actualizar el estado localmente
        publication.userLiked = !publication.userLiked;
        publication.numberLikes += publication.userLiked ? 1 : -1;
      },
      error: (err) => {
        console.error('Error al dar/quitar like:', err);
      }
    });
  }

  // Manejar eliminación de publicación
  handleDelete(publicationId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    this.publicationsService.deletePublication(publicationId).subscribe({
      next: () => {
        // Eliminar de la lista local
        this.user.update(current => {
          if (!current) return current;
          return {
            ...current,
            lastPublications: current.lastPublications.filter(p => p._id !== publicationId)
          };
        });
        console.log('✅ Publicación eliminada');
      },
      error: (err) => {
        console.error('❌ Error al eliminar publicación:', err);
        alert('No se pudo eliminar la publicación');
      }
    });
  }

  // Calcular edad desde fecha de nacimiento
  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Formatear fecha de nacimiento
  formatBirthDate(birthDate: string): string {
    const date = new Date(birthDate);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}





