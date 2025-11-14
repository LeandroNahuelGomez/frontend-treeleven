
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  route?: string;
}


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  activeItem: string = 'inicio';

  private router = inject(Router);

  menuItems: MenuItem[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'buscar', icon: 'search', label: 'Buscar', route: '/search' },
    { id: 'mensajes', icon: 'send', label: 'Mensajes', route: '/messages' },
    { id: 'notificaciones', icon: 'favorite', label: 'Notificaciones', route: '/notifications' },
    { id: 'crear', icon: 'add_box', label: 'Crear', route: '/create' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' },
    { id: 'guardados', icon: 'bookmark', label: 'Guardados', route: '/saved' },
    { id: 'logout', icon: 'logout', label: 'Logout', route: '/logout' }
  ];

  // Menu reducido para mobile (como Instagram)
  mobileMenuItems: MenuItem[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'buscar', icon: 'search', label: 'Buscar', route: '/search' },
    { id: 'crear', icon: 'add_box', label: 'Crear', route: '/create' },
    { id: 'mensajes', icon: 'send', label: 'Mensajes', route: '/messages' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' }
  ];

  handleMenuItemClick(item: MenuItem): void {
    // Actualizar item activo
    this.activeItem = item.id;

    // Ejecutar acción específica para cada item
    switch (item.id) {
      case 'inicio':
        this.goToHome();
        break;
      case 'buscar':
        this.openSearch();
        break;
      case 'mensajes':
        this.openMessages();
        break;
      case 'notificaciones':
        this.showNotifications();
        break;
      case 'crear':
        this.openCreateModal();
        break;
      case 'perfil':
        this.goToProfile();
        break;
      case 'guardados':
        this.showSavedItems();
        break;
      case 'logout':
        this.goToHome();
        break;
      default:
        this.router.navigate([item.route]);
    }
  }

  private goToHome(): void {
    console.log('Navegando al inicio');
    this.router.navigate(['/home']);
  }

  private openSearch(): void {
    console.log('Abriendo búsqueda');
  }

  private openMessages(): void {
    console.log('Abriendo mensajes');
  }

  private showNotifications(): void {
    console.log('Mostrando notificaciones');
  }

  private openCreateModal(): void {
    console.log('Abriendo modal de creación');
  }

  private goToProfile(): void {
    console.log('Yendo al perfil');
    this.router.navigate(['/mi-perfil']);
  }

  private showSavedItems(): void {
    console.log('Mostrando items guardados');
    // this.router.navigate(['/saved']);
  }

  setActiveItem(itemId: string): void {
    this.activeItem = itemId;
  }
}
