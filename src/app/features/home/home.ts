import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Register } from '../auth/register/register';
import { Login } from '../auth/login/login';
import { CommonModule } from '@angular/common';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  imports: [Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/registro']);
  }
}
