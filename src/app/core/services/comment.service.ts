import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { filter, Observable } from 'rxjs';
import { CommentsResponse, CreateCommentRequest } from '../../shared/models/comment.model';

@Injectable({
    providedIn: 'root'
})

export class CommentsService {
    private apiUrl = "https://backend-treeleven.onrender.com/api/publications"

    constructor(private http: HttpClient) { }


    //Obtenemos los comentarios de la publicacion
    getComments(
        publicationId: string,
        offset: number = 0,
        limit: number = 10
    ): Observable<CommentsResponse> {
        const params = new HttpParams()
            .set("offset", offset.toString())
            .set("limit", limit.toString())

        return this.http.get<CommentsResponse>(
            `${this.apiUrl}/${publicationId}/comments`,
            { params, withCredentials: true }
        )
    }

    //Crea un nuevo comentario
    createComment(
        publicationId: string,
        data: CreateCommentRequest
    ): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/${publicationId}/comments`,
            data,
            { withCredentials: true }
        );
    }

    //Edita un comentario
    updateComment(
        publicationId: string,
        commentId: string,
        data: CreateCommentRequest
    ): Observable<any> {
        return this.http.put(
            `${this.apiUrl}/${publicationId}/comments/${commentId}`,
            data,
            { withCredentials: true }
        );
    }

    /**
     * Elimina un comentario
     */
    deleteComment(
        publicationId: string,
        commentId: string
    ): Observable<any> {
        return this.http.delete(
            `${this.apiUrl}/${publicationId}/comments/${commentId}`,
            { withCredentials: true }
        );
    }



}