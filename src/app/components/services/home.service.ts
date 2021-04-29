import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Chart } from '../model/chart.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  baseURL = 'https://run.mocky.io/v3/74cd378b-e49f-4592-98ec-4ae8c71697d3';

  testeLinesRiskURL =
    'https://run.mocky.io/v3/010c0ea7-77d6-4cef-a68f-804d3693d106';

  constructor(private http: HttpClient) {}

  getData(): Observable<Chart[]> {
    return this.http.get<Chart[]>(this.testeLinesRiskURL);
  }

  async getRMs(): Promise<Chart[]> {
    // let rms = await this.getData().toPromise();

    let rms = await this.http.get<Chart[]>(this.testeLinesRiskURL).toPromise();

    rms = rms.filter((data) => data.rm == true);

    return rms;
  }

  sortBy(array: Chart[], by: string): Chart[] {
    return array.sort(
      (a: any, b: any) => 0 - (a[by].value > b[by].value ? -1 : 1)
    );
  }
}
