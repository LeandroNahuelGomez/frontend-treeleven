import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatisticsService } from '../core/services/statistics.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { CleanTextPipe } from '../core/pipes/clean-text-pipe-pipe';


// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, CleanTextPipe],
  templateUrl: './dashboardPrueba.html',
  styleUrl: './dashboardPrueba.css'
})
export class DashboardStatsComponent implements OnInit {
  @ViewChild('publicationsByUserChart') pubByUserCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('commentsByPeriodChart') commentsPeriodCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('commentsByPublicationChart') commentsPubCanvas!: ElementRef<HTMLCanvasElement>;

  // Charts instances
  private publicationsByUserChart?: Chart;
  private commentsByPeriodChart?: Chart;
  private commentsByPublicationChart?: Chart;

  // Forms
  publicationsForm: FormGroup;
  commentsForm: FormGroup;
  commentsByPubForm: FormGroup;

  // Signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  overview = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializar formularios con fechas por defecto
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.publicationsForm = this.fb.group({
      startDate: [this.formatDate(thirtyDaysAgo), Validators.required],
      endDate: [this.formatDate(today), Validators.required]
    });

    this.commentsForm = this.fb.group({
      startDate: [this.formatDate(thirtyDaysAgo), Validators.required],
      endDate: [this.formatDate(today), Validators.required]
    });

    this.commentsByPubForm = this.fb.group({
      startDate: [this.formatDate(thirtyDaysAgo), Validators.required],
      endDate: [this.formatDate(today), Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar que sea administrador
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/publicaciones']);
      return;
    }

    this.loadOverview();
  }

  ngAfterViewInit(): void {
    // Cargar datos iniciales después de que las vistas estén listas
    setTimeout(() => {
      this.loadPublicationsByUser();
      this.loadCommentsByPeriod();
      this.loadCommentsByPublication();
    }, 100);
  }

  ngOnDestroy(): void {
    // Destruir charts al salir del componente
    this.publicationsByUserChart?.destroy();
    this.commentsByPeriodChart?.destroy();
    this.commentsByPublicationChart?.destroy();
  }

  // ========== CARGAR DATOS ==========

  loadOverview(): void {
    this.statisticsService.getOverview().subscribe({
      next: (res) => {
        this.overview.set(res.data);
      },
      error: (err) => {
        console.error('Error cargando overview:', err);
      }
    });
  }

  loadPublicationsByUser(): void {
    if (this.publicationsForm.invalid) return;

    this.isLoading.set(true);
    const { startDate, endDate } = this.publicationsForm.value;

    this.statisticsService.getPublicationsByUser(startDate, endDate).subscribe({
      next: (res) => {
        this.renderPublicationsByUserChart(res.data.statistics);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando publicaciones por usuario:', err);
        this.error.set('Error al cargar las estadísticas');
        this.isLoading.set(false);
      }
    });
  }

  loadCommentsByPeriod(): void {
    if (this.commentsForm.invalid) return;

    this.isLoading.set(true);
    const { startDate, endDate } = this.commentsForm.value;

    this.statisticsService.getCommentsByPeriod(startDate, endDate).subscribe({
      next: (res) => {
        this.renderCommentsByPeriodChart(res.data.commentsByDay);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando comentarios por período:', err);
        this.error.set('Error al cargar las estadísticas');
        this.isLoading.set(false);
      }
    });
  }

  loadCommentsByPublication(): void {
    if (this.commentsByPubForm.invalid) return;

    this.isLoading.set(true);
    const { startDate, endDate } = this.commentsByPubForm.value;

    this.statisticsService.getCommentsByPublication(startDate, endDate).subscribe({
      next: (res) => {
        this.renderCommentsByPublicationChart(res.data.statistics);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando comentarios por publicación:', err);
        this.error.set('Error al cargar las estadísticas');
        this.isLoading.set(false);
      }
    });
  }

  // ========== RENDER CHARTS ==========

  private renderPublicationsByUserChart(data: any[]): void {
    if (this.publicationsByUserChart) {
      this.publicationsByUserChart.destroy();
    }

    const ctx = this.pubByUserCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => item.userName || item.fullName);
    const values = data.map(item => item.count);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Publicaciones',
          data: values,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Publicaciones por Usuario',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.publicationsByUserChart = new Chart(ctx, config);
  }

  private renderCommentsByPeriodChart(data: any[]): void {
    if (this.commentsByPeriodChart) {
      this.commentsByPeriodChart.destroy();
    }

    const ctx = this.commentsPeriodCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    const values = data.map(item => item.count);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Comentarios',
          data: values,
          borderColor: 'rgba(118, 75, 162, 1)',
          backgroundColor: 'rgba(118, 75, 162, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Comentarios por Día',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.commentsByPeriodChart = new Chart(ctx, config);
  }

  private renderCommentsByPublicationChart(data: any[]): void {
    if (this.commentsByPublicationChart) {
      this.commentsByPublicationChart.destroy();
    }

    const ctx = this.commentsPubCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Tomar solo las top 10 publicaciones
    const topData = data.slice(0, 10);
    const labels = topData.map(item => this.truncateTitle(item.publicationTitle, 30));
    const values = topData.map(item => item.commentCount);

    // Colores variados para gráfico de torta
    const backgroundColors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(46, 204, 113, 0.8)',
      'rgba(231, 76, 60, 0.8)'
    ];

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          title: {
            display: true,
            text: 'Top 10 Publicaciones con más Comentarios',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    };

    this.commentsByPublicationChart = new Chart(ctx, config);
  }

  // ========== HELPERS ==========

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  // Presets de fechas
  setLast7Days(formName: 'publications' | 'comments' | 'commentsByPub'): void {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const form = this.getForm(formName);
    form.patchValue({
      startDate: this.formatDate(sevenDaysAgo),
      endDate: this.formatDate(today)
    });

    this.reloadChart(formName);
  }

  setLast30Days(formName: 'publications' | 'comments' | 'commentsByPub'): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const form = this.getForm(formName);
    form.patchValue({
      startDate: this.formatDate(thirtyDaysAgo),
      endDate: this.formatDate(today)
    });

    this.reloadChart(formName);
  }

  setLast90Days(formName: 'publications' | 'comments' | 'commentsByPub'): void {
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const form = this.getForm(formName);
    form.patchValue({
      startDate: this.formatDate(ninetyDaysAgo),
      endDate: this.formatDate(today)
    });

    this.reloadChart(formName);
  }

  private getForm(formName: string): FormGroup {
    switch (formName) {
      case 'publications': return this.publicationsForm;
      case 'comments': return this.commentsForm;
      case 'commentsByPub': return this.commentsByPubForm;
      default: return this.publicationsForm;
    }
  }

  private reloadChart(formName: string): void {
    switch (formName) {
      case 'publications': this.loadPublicationsByUser(); break;
      case 'comments': this.loadCommentsByPeriod(); break;
      case 'commentsByPub': this.loadCommentsByPublication(); break;
    }
  }
}