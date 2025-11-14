import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';

interface Comentario {
  autor: string;
  texto: string;
}

interface Publicacion {
  id: number;
  contenido: string;
  fecha: string;
  likes: number;
  comentarios: Comentario[];
}

interface Usuario {
  nombre: string;
  email: string;
  fechaRegistro: string;
  ubicacion: string;
  bio: string;
  fotoPerfil: string;
}


@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  usuario: Usuario = {
    nombre: "Ana García",
    email: "ana.garcia@email.com",
    fechaRegistro: "Enero 2024",
    ubicacion: "Buenos Aires, Argentina",
    bio: "Apasionada por la tecnología y el desarrollo web. Siempre aprendiendo cosas nuevas.",
    fotoPerfil: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
  };

  publicaciones: Publicacion[] = [
    {
      id: 1,
      contenido: "¡Acabo de terminar mi proyecto de Angular! Fue un desafío increíble pero aprendí muchísimo sobre componentes y servicios.",
      fecha: "Hace 2 días",
      likes: 24,
      comentarios: [
        { autor: "Carlos López", texto: "¡Felicitaciones! Se ve genial" },
        { autor: "María Rodríguez", texto: "Excelente trabajo, me inspira a seguir aprendiendo" }
      ]
    },
    {
      id: 2,
      contenido: "Explorando las nuevas características de CSS Grid. Es impresionante lo que se puede lograr con layouts modernos.",
      fecha: "Hace 5 días",
      likes: 18,
      comentarios: [
        { autor: "Juan Pérez", texto: "CSS Grid es lo mejor que le pasó al desarrollo web" }
      ]
    },
    {
      id: 3,
      contenido: "Compartiendo mi experiencia con TypeScript. Al principio fue difícil, pero ahora no puedo imaginar trabajar sin él.",
      fecha: "Hace 1 semana",
      likes: 31,
      comentarios: [
        { autor: "Laura Martínez", texto: "Totalmente de acuerdo, TypeScript mejora mucho la calidad del código" },
        { autor: "Pedro Sánchez", texto: "¿Algún recurso que recomiendes para empezar?" },
        { autor: "Ana García", texto: "Te recomiendo la documentación oficial y los ejercicios de TypeScript Exercises" }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí podrías cargar los datos desde un servicio
    // this.cargarDatosUsuario();
    // this.cargarPublicaciones();
  }

}
