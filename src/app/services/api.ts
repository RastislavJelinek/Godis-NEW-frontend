import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAvailableDatabases() {
    return this.http.get<string[]>(`${this.baseUrl}/banka/availableDatabases`);
  }

  uploadFile(formData: FormData) {
    return this.http.post(`${this.baseUrl}/banka/xlsx`, formData);
  }

  shutdown() {
    return this.http.get(`${this.baseUrl}/banka/shutdown`);
  }
}
