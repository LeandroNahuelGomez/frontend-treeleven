import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { PublicationCardComponent } from '../../publication-card/publication-card';
import { FormsModule } from '@angular/forms';
import { Publication } from '../../shared/models/publication.model';
import { OrderPublications, PublicationsService } from '../../core/services/publications.service';
import Swal from 'sweetalert2';
import { InfiniteScrollDirective } from '../../core/directives/infinite-scroll-directive';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [Navbar, CommonModule, PublicationCardComponent, FormsModule, InfiniteScrollDirective],
  templateUrl: './publications.html',
  styleUrl: './publications.css',
})
export class Publications implements OnInit {
  publications = signal<Publication[]>([]);   //Signal que trae todas las publicaciones en un array
  loading = signal(false); //Signal para mostrar spinner
  orderBy: OrderPublications = "fecha"; //Variable que cambia para ordenar las publis
  offset = 0;
  limit = 3;
  hasMore = signal(true);
  showModal = false;



  //Computed signals para estados derivados --> Son señales que derivan su valor de otras señales. Valores automaticamente calculados
  isEmpty = computed(() => this.publications().length === 0);
  showEmptyState = computed(() => !this.loading() && this.isEmpty())
  showLoadMore = computed(() => this.hasMore() && !this.loading() && !this.isEmpty())


  // Form data para nueva publicación
  newPublication = {
    title: '',
    description: '',
    image: undefined as File | undefined
  };

  // previewUrl: string | null = null;
  previewUrl = signal<string | null>(null);

  constructor(private publicationsService: PublicationsService) { }

  ngOnInit(): void {
    this.loadPublications();
  }


  loadPublications(reset: boolean = false): void {
    if (reset) {
      this.offset = 0;
      this.publications.set([]); //Usamos set() en lugar de asignacion
    }

    this.loading.set(true);

    this.publicationsService.getPublications(this.orderBy, this.offset, this.limit)
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (reset) {
              this.publications.set(response.data.publications)
            } else {
              this.publications.update(current => [...current, ...response.data.publications])
            }
            this.hasMore.set(response.data.pagination.hasMore);
            this.offset += this.limit;
            console.log("Publicaciones cargadas: ", this.publications());
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  // loadComments(): void {
  //   console.log(this.publication._id)
  //   this.publicationsService.getComments(this.publication._id).subscribe({
  //     next: (res) => {
  //       console.log("La data de respuesta es: ", res.comments)
  //       this.comments.set(res.comments);
  //     }
  //   });
  // }

  changeOrder(order: OrderPublications): void {
    this.orderBy = order;
    this.loadPublications(true);
  }

  handleScroll():void {
    //Solo carga si hay mas y no esta cargando
    if(this.hasMore() && !this.loading()){
      this.loadPublications();
    }
  }

  // loadMore(): void {
  //   if (this.hasMore() && !this.loading()) {
  //     this.loadPublications();
  //   }
  // }

  handleLikeToggle(publicationId: string): void {
    const publication = this.publications().find(p => p._id === publicationId);
    if (!publication) return;

    const action = publication.userLiked
      ? this.publicationsService.removeLike(publicationId)
      : this.publicationsService.giveLike(publicationId);

    action.subscribe({
      next: () => {
        this.publications.update(current =>
          current.map(pub => {
            if (pub._id === publicationId) {
              return {
                ...pub,
                userLiked: !pub.userLiked,
                numberLikes: pub.userLiked
                  ? pub.numberLikes - 1
                  : pub.numberLikes + 1
              }
            }
            return pub;
          })
        );
      },
      error: (err) => {
        console.error("Error al dar like: ", err)
      }
    });
  }

  handleDelete(publicationId: string): void {
    Swal.fire({
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationsService.deletePublication(publicationId).subscribe({
          next: () => {
            this.publications.update(current =>
              current.filter(p => p._id !== publicationId)
            );

            Swal.fire({
              icon: 'success',
              title: '¡Eliminada!',
              text: 'La publicación fue eliminada',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadPublications(true);
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la publicacion',
              timer: 2000,
              showConfirmButton: false
            })
          }
        });
      }
    });
  }

  // Agregar estos métodos a tu publications.ts

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Solo se permiten imágenes'
        });
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La imagen no puede superar los 5MB'
        });
        return;
      }

      this.newPublication.image = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        // this.previewUrl = reader.result as string;
        this.previewUrl.set(reader.result as string)
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.newPublication.image = undefined;
    // this.previewUrl = null;
    this.previewUrl.set(null)
  }

  createPublication(): void {
    console.log("Datos a enviar: ", this.newPublication)
    console.log(typeof this.newPublication.title)
    console.log(typeof this.newPublication.description)
    console.log(typeof this.newPublication.image)
    if (!this.newPublication.title.trim() || !this.newPublication.description.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El título y la descripción son obligatorios'
      });
      return;
    }

    this.loading.set(true);

    this.publicationsService.createPublication(this.newPublication).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.closeModal();

        Swal.fire({
          icon: 'success',
          title: '¡Publicado!',
          text: 'Tu publicación fue creada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });

        // Recargar publicaciones para mostrar la nueva
        this.loadPublications(true);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error creando publicación:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la publicación'
        });
      }
    });
  }

  resetForm(): void {
    this.newPublication = {
      title: '',
      description: '',
      image: undefined
    };
    // this.previewUrl = null;
    this.previewUrl.set(null)
  }

}
