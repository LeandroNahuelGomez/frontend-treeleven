import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicationCardComponent } from '../../publication-card/publication-card';
import { User, UsersService } from '../../core/services/user.service';
import { PublicationsService } from '../../core/services/publications.service';
import { Publication, PublicationsResponse } from '../../shared/models/publication.model';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

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
    private publicationsService: PublicationsService,
    private route: ActivatedRoute
  ) { }

  // ngOnInit(): void {
  //   this.loadProfile();
  // }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Perfil de OTRO usuario
      this.loadProfileById(id);
    } else {
      // Perfil propio
      this.loadProfile();
    }
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

  loadProfileById(id: string): void {
    this.userService.getUserProfileById(id).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil del usuario.');
        this.isLoading.set(false);
      }
    });
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
        // Actualizar Signal correctamente
        this.user.update(current => {
          if (!current) return current;
          return {
            ...current,
            lastPublications: current.lastPublications.map(pub => {
              if (pub._id === publicationId) {
                return {
                  ...pub,
                  userLiked: !pub.userLiked,
                  numberLikes: pub.userLiked ? pub.numberLikes - 1 : pub.numberLikes + 1
                };
              }
              return pub;
            })
          };
        });
      },
      error: (err) => {
        console.error('Error al dar/quitar like:', err);
      }
    });
  }

  // Manejar eliminación de publicación
  // handleDelete(publicationId: string): void {
  //   if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
  //     return;
  //   }

  //   this.publicationsService.deletePublication(publicationId).subscribe({
  //     next: () => {
  //       // Eliminar de la lista local
  //       this.user.update(current => {
  //         if (!current) return current;
  //         return {
  //           ...current,
  //           lastPublications: current.lastPublications.filter(p => p._id !== publicationId)
  //         };
  //       });
  //       console.log('✅ Publicación eliminada');
  //     },
  //     error: (err) => {
  //       console.error('❌ Error al eliminar publicación:', err);
  //       alert('No se pudo eliminar la publicación');
  //     }
  //   });
  // }
  handleDelete(publicationId: string): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (!result.isConfirmed) return;

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

        Swal.fire('Eliminado', 'La publicación fue eliminada.', 'success');
        console.log('✅ Publicación eliminada');
      },
      error: (err) => {
        console.error('❌ Error al eliminar publicación:', err);
        Swal.fire('Error', 'No se pudo eliminar la publicación', 'error');
      }
    });
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





