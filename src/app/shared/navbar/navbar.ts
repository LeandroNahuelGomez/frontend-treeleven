
import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

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
  isAdmin = signal(false);

  private router = inject(Router);

  constructor(
    private authService: AuthService
  ) {
    const isAdmin = this.authService.isAdmin()
    this.isAdmin.set(isAdmin);
  }

  menuItems: MenuItem[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'buscar', icon: 'search', label: 'Buscar', route: '/search' },
    // { id: 'mensajes', icon: 'send', label: 'Mensajes', route: '/messages' },
    // { id: 'crear', icon: 'add_box', label: 'Crear', route: '/create' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' },
    { id: 'guardados', icon: 'bookmark', label: 'Guardados', route: '/saved' },
    { id: 'logout', icon: 'logout', label: 'Logout', route: '/logout' }
  ];

  adminMenuItems: MenuItem[] = [ // <-- NUEVO: Ítems solo para administradores
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' },
    { id: 'dashboard-admin', icon: 'admin_panel_settings', label: 'Dashboard', route: '/dashboard-user' },
    { id: 'stats', icon: 'bar_chart', label: 'Estadísticas', route: '/dashboard-stats' },
    { id: 'logout', icon: 'logout', label: 'Logout', route: '/logout' }
  ];

  // Menu reducido para mobile (como Instagram)
  mobileMenuItems: MenuItem[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'buscar', icon: 'search', label: 'Buscar', route: '/search' },
    // { id: 'mensajes', icon: 'send', label: 'Mensajes', route: '/messages' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' },
    { id: 'logout', icon: 'logout', label: 'Logout', route: '/logout' }
  ];

  adminMobileMenuItems: MenuItem[] = [
    { id: 'inicio', icon: 'home', label: 'Inicio', route: '/home' },
    { id: 'perfil', icon: 'person', label: 'Perfil', route: '/profile' },
    { id: 'dashboard-admin', icon: 'admin_panel_settings', label: 'Dashboard', route: '/dashboard-user' },
    { id: 'stats', icon: 'bar_chart', label: 'Estadísticas', route: '/dashboard-stats' },
    { id: 'logout', icon: 'logout', label: 'Logout', route: '/logout' }
  ];

  // COMPUTED: Determina qué lista de menú de escritorio mostrar
  finalMenuItems = computed(() => {
    // Si isAdmin() es true, usa la lista completa de admin. Si no, usa la estándar.
    return this.isAdmin() ? this.adminMenuItems : this.menuItems;
  });


  // COMPUTED: Determina qué lista de menú móvil mostrar
  finalMobileMenuItems = computed(() => {
    return this.isAdmin() ? this.adminMobileMenuItems : this.mobileMenuItems;
  });


  handleMenuItemClick(item: MenuItem): void {
    // Actualizar item activo
    this.activeItem = item.id;

    // Ejecutar acción específica para cada item
    switch (item.id) {
      case 'inicio':
        this.goToPublications();
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
      // case 'crear':
      //   this.openCreateModal();
      //   break;
      case 'perfil':
        this.goToProfile();
        break;
      case 'guardados':
        this.showSavedItems();
        break;
      case 'dashboard-admin':
        this.dashboardAdmin();
        break;
      case 'dashboard-stats':
        this.dashboardStats();
        break;
      case 'logout':
        this.logout()
        break;
      default:
        this.router.navigate([item.route]);
    }
  }

  dashboardStats() {
    console.log("Navegando al dashboard stats")
    this.router.navigate(['/dashboard-stats']);
  }

  dashboardAdmin() {
    console.log("Navegando al dashboard users")
    this.router.navigate(['/dashboard-user']);
  }

  private logout(): void {
    this.authService.logout().subscribe({
      next: res => {
        console.log('Logout completado:', res);
        // Redirigir al login después del logout
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Error en logout:', err);
        // Redirigir al login aunque haya error
        this.router.navigate(['/login']);
      }
    });
  }

  private goToPublications(): void {
    console.log('Navegando al inicio');
    this.router.navigate(['/publicaciones']);
  }

  private openSearch(): void {
    console.log('Abriendo búsqueda');
  }

  private openMessages(): void {
    console.log('Abriendo mensajes');
    this.router.navigate(['/dashboard-user'])
  }

  private showNotifications(): void {
    console.log('Mostrando notificaciones');
    this.router.navigate(["/publication-detail"])
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
    this.router.navigate(['/dashboard-stats'])
    // this.router.navigate(['/saved']);
  }

  setActiveItem(itemId: string): void {
    this.activeItem = itemId;
  }
}
