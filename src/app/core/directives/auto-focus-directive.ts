import { Directive, OnInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutoFocusDirective]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 0);
  }
}