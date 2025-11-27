import { Pipe, PipeTransform } from '@angular/core';

// Elimina espacios en blanco innecesarios al inicio/fin y transforma a minúsculas.
// Uso: {{ ' Mi Texto ' | cleanText:'lower' }} -> "mi texto"

type CleanMode = 'none' | 'trim' | 'lower' | 'upper';

@Pipe({
  name: 'cleanTextPipe',
  standalone: true
})
export class CleanTextPipe implements PipeTransform {

  /**
   * Transforma una cadena de texto según un modo especificado.
   * @param value El texto de entrada.
   * @param mode El modo de limpieza: 'trim', 'lower', 'upper', 'none'.
   */
  transform(value: string | null | undefined, mode: CleanMode = 'trim'): string {
    if (value === null || value === undefined) {
      return '';
    }

    let result = value;

    // 1. Limpieza de espacios al inicio/fin (siempre es buena práctica)
    if (mode === 'trim' || mode === 'lower' || mode === 'upper') {
      result = result.trim();
    }

    // 2. Aplicar el formato de caso
    switch (mode) {
      case 'lower':
        result = result.toLowerCase();
        break;
      case 'upper':
        result = result.toUpperCase();
        break;
      // 'trim' o 'none' no cambian el caso
    }

    return result;
  }
}
