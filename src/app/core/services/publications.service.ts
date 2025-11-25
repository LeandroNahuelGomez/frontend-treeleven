import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    AuthorDto,
    Publication,
    PublicationsResponse,
    CreatePublicationRequest
} from '../../shared/models/publication.model';

export type OrderPublications = 'fecha' | 'likes';

@Injectable({
    providedIn: "root"
})

export class PublicationsService {
    private apiUrl = 'https://backend-treeleven.onrender.com/api/publications';

    constructor(private http: HttpClient) { }

    getPublications(
        orderBy: OrderPublications = 'fecha',
        offset: number = 0,
        limit: number = 10,
        userId?: string
    ): Observable<PublicationsResponse> {
        let params = new HttpParams()
            .set('orderBy', orderBy)
            .set('offset', offset.toString())
            .set('limit', limit.toString())

        if (userId) {
            params = params.set('userId', userId)
        }

        return this.http.get<PublicationsResponse>(this.apiUrl, {
            params,
            withCredentials: true
        })
    }


    getPublicationById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`, {
            withCredentials: true
        })
    }

    createPublication(data: CreatePublicationRequest): Observable<any> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);

        if (data.image) {
            formData.append('image', data.image);
        }

        return this.http.post(this.apiUrl, formData, { withCredentials: true });
    }


    deletePublication(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    giveLike(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/like`, {}, { withCredentials: true });
    }

    removeLike(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}/like`, { withCredentials: true });
    }


    addComment(publicationId: string, content: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${publicationId}/comment`,
            { content },
            { withCredentials: true }
        )
    }

    getComments(publicationId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${publicationId}/comment`,
            { withCredentials: true }
        )
    }


}