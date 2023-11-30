import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  constructor(
    private http: HttpClient
  ) { }

  getData<T>(endPoint: string): Observable<T> {
    const url = endPoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })

    return this.http.get<T>(url, { headers })
  }
}
