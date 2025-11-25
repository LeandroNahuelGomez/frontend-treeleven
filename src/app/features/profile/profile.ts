import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { PublicationCardComponent } from '../../publication-card/publication-card';
import { User, UsersService } from '../../core/services/user.service';
import { PublicationsService } from '../../core/services/publications.service';

export interface ProfileData {
  name: string;
  email: string;
  description: string;
  profileImageUrl: string;
  birthDate: string;
  lastPublicications: Publication[];
}

export interface Publication {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  imageUrl?: string;
  userLiked?: boolean,
}

export interface Comment {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
}


@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar],
  templateUrl: './pruebaProfile.html',
  styleUrl: './pruebaProfile.css',
})

export class Profile implements OnInit {
  user = signal<ProfileData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private userService: UsersService
  ){}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void{
    this.userService.getMyProfile().subscribe({
      next: (res) => {
        this.user.set(res.data)
        this.isLoading.set(false);
        console.log(res.data);
      },
      error: (err) => {
        this.error.set('No se pudo cargar el perfil.');
        this.isLoading.set(false);
        console.error(err);
      }
    })
  }
 

  // handleLikeToggle(publicationId: string): void {
  //   const publication = this.publications.find(p => p._id === publicationId);
  //   if (!publication) return;

  //   const action = publication.userLiked
  //     ? this.publicationsService.removeLike(publicationId)
  //     : this.publicationsService.giveLike(publicationId);

  //   action.subscribe({
  //     next: () => {
  //       publication.userLiked = !publication.userLiked;
  //       publication.numberLikes += publication.userLiked ? 1 : -1;
  //     }
  //   });
  // }

  // handleDelete(publicationId: string): void {
  //   this.publications = this.publications.filter(p => p._id !== publicationId);
  // }

  // getAge(birthDate: Date): number {
  //   const today = new Date();
  //   const birth = new Date(birthDate);
  //   let age = today.getFullYear() - birth.getFullYear();
  //   const monthDiff = today.getMonth() - birth.getMonth();

  //   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
  //     age--;
  //   }

  //   return age;
  // }

  // publicaciones: Publicacion[] = [
  //   {
  //     id: 1,
  //     contenido: "¡Acabo de terminar mi proyecto de Angular! Fue un desafío increíble pero aprendí muchísimo sobre componentes y servicios.",
  //     fecha: "Hace 2 días",
  //     likes: 24,
  //     comentarios: [
  //       { autor: "Carlos López", texto: "¡Felicitaciones! Se ve genial" },
  //       { autor: "María Rodríguez", texto: "Excelente trabajo, me inspira a seguir aprendiendo" }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     contenido: "Explorando las nuevas características de CSS Grid. Es impresionante lo que se puede lograr con layouts modernos.",
  //     fecha: "Hace 5 días",
  //     likes: 18,
  //     comentarios: [
  //       { autor: "Juan Pérez", texto: "CSS Grid es lo mejor que le pasó al desarrollo web" }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     contenido: "Compartiendo mi experiencia con TypeScript. Al principio fue difícil, pero ahora no puedo imaginar trabajar sin él.",
  //     fecha: "Hace 1 semana",
  //     likes: 31,
  //     comentarios: [
  //       { autor: "Laura Martínez", texto: "Totalmente de acuerdo, TypeScript mejora mucho la calidad del código" },
  //       { autor: "Pedro Sánchez", texto: "¿Algún recurso que recomiendes para empezar?" },
  //       { autor: "Ana García", texto: "Te recomiendo la documentación oficial y los ejercicios de TypeScript Exercises" }
  //     ]
  //   }
  // ];


}
