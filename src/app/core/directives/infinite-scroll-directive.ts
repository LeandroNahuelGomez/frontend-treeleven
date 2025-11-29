import { Directive, ElementRef, HostListener, Output, EventEmitter, Input, OnInit,OnDestroy } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appInfiniteScrollDirective]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy{
  //Evento que el componente usara para cargar mas datos
  @Output() scrolledBottom = new EventEmitter<void>();

  // Distancia en píxeles desde el final del scroll para considerarlo "alcanzado".
  // Se usa para empezar a cargar *antes* de llegar al final.
  @Input() scrollThreshold = 100;

  // Un Subject para gestionar la limpieza de suscripciones.
  private destroy$ = new Subject<void>();
  
  // Un Subject para manejar el debouncing del evento de scroll.
  private scrollEvent$ = new Subject<void>();

  constructor(private el:ElementRef) { }

  ngOnInit(): void {
    // Escuchamos el evento de scroll con un "debounce" para limitar la frecuencia de las llamadas.
    this.scrollEvent$
      .pipe(
        debounceTime(200), // Espera 200ms después del último scroll antes de emitir
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkScrollPosition();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Escucha el evento de scroll en el host (en este caso, la ventana/documento).
  // Si tu lista estuviera en un contenedor con scroll propio, cambiarías `window:scroll` por `host:scroll`.
  // Para el scroll de la página (documento) es mejor usar `window:scroll`.
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrollEvent$.next();
  }

  private checkScrollPosition(): void {
    // ⭐️ Cálculo clave para el scroll infinito:
    // 1. document.documentElement.scrollHeight: Altura total del contenido del documento.
    // 2. window.innerHeight: Altura del viewport (lo que se ve).
    // 3. window.scrollY: Posición actual del scroll desde la parte superior.
    
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Distancia restante hasta el final: 
    const remainingDistance = scrollHeight - (scrollTop + clientHeight);

    // Si la distancia restante es menor o igual al umbral, emitimos el evento.
    if (remainingDistance <= this.scrollThreshold) {
      this.scrolledBottom.emit();
    }
  }

}
