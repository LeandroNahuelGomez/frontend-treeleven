import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverColor]',
  standalone: true
})
export class HoverColorDirective {

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.color = 'blue';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.color = '';
  }
}
