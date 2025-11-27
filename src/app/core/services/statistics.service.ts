import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicationsByUserStat {
  userId: string;
  userName: string;
  fullName: string;
  count: number;
}

export interface CommentsByDay {
  date: string;
  count: number;
}

export interface CommentsByPeriodResponse {
  totalComments: number;
  commentsByDay: CommentsByDay[];
}

export interface CommentsByPublicationStat {
  publicationId: string;
  publicationTitle: string;
  commentCount: number;
}

export interface OverviewStats {
  totalUsers: number;
  totalPublications: number;
  totalComments: number;
  last30Days: {
    publications: number;
    comments: number;
  };
}

export interface StatisticsResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
    private readonly API_URL = 'https://backend-treeleven.onrender.com/api'
  private apiUrl = `${this.API_URL}/publications/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener publicaciones por usuario en un rango de fechas
   */
  getPublicationsByUser(
    startDate: string,
    endDate: string
  ): Observable<StatisticsResponse<{ startDate: Date; endDate: Date; statistics: PublicationsByUserStat[] }>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<StatisticsResponse<any>>(
      `${this.apiUrl}/publications-by-user`,
      { params, withCredentials: true },
    );
  }

  /**
   * Obtener comentarios por período (día a día)
   */
  getCommentsByPeriod(
    startDate: string,
    endDate: string
  ): Observable<StatisticsResponse<CommentsByPeriodResponse>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<StatisticsResponse<any>>(
      `${this.apiUrl}/comments-by-period`,
      { params, withCredentials: true }
    );
  }

  /**
   * Obtener comentarios por publicación
   */
  getCommentsByPublication(
    startDate: string,
    endDate: string
  ): Observable<StatisticsResponse<{ startDate: Date; endDate: Date; statistics: CommentsByPublicationStat[] }>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<StatisticsResponse<any>>(
      `${this.apiUrl}/comments-by-publication`,
      { params, withCredentials: true }
    );
  }

  /**
   * Obtener resumen general de estadísticas
   */
  getOverview(): Observable<StatisticsResponse<OverviewStats>> {
    return this.http.get<StatisticsResponse<OverviewStats>>(
      `${this.apiUrl}/overview`,
      {withCredentials: true}
    );
  }
}