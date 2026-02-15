import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserData } from './user.model';
import { environment } from '../../environments/environment';

export interface PaginatedResponse {
  data: UserData[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  /**
   * @param start 1-based start index
   * @param limit number of items to return
   */
  getUsersPaginated(start = 1, limit = 10): Observable<PaginatedResponse> {
    const params = new HttpParams().set('start', String(start)).set('limit', String(limit));
    return this.http.get<PaginatedResponse>(`${this.baseUrl}/users`, { params });
  }

  syncUsers(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/execute`, null);
  }

  truncateUsers(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/truncate`);
  }
}
