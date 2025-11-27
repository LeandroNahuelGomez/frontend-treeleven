import { Pipe, PipeTransform } from '@angular/core';
// Convierte una fecha a formato "Hace X tiempo"
// Uso: {{ publicacion.createdAt | timeAgo }}

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | string): string {
    if (!value) return '';

    const now = new Date();
    const date = new Date(value);
    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    if (diffMonths < 12) return `Hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
    return `Hace ${diffYears} año${diffYears !== 1 ? 's' : ''}`;
  }

}
