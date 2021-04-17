import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Home } from '../model/home.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  baseURL = 'https://run.mocky.io/v3/74cd378b-e49f-4592-98ec-4ae8c71697d3';

  constructor(private http: HttpClient) {}

  getData(): Observable<Home[]> {
    return this.http.get<Home[]>(this.baseURL);
  }
}
