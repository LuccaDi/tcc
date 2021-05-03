import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Solution } from '../model/solution.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  baseURL = 'https://run.mocky.io/v3/74cd378b-e49f-4592-98ec-4ae8c71697d3';

  testeLinesRiskURL =
    'https://run.mocky.io/v3/6db2582c-6eee-4243-a13c-ab82b77c4e14';

  testeNewJson = 'https://run.mocky.io/v3/67e9a971-49f2-4b34-ab1a-b33a7e097b6e';

  constructor(private http: HttpClient) {}

  getData(): Observable<Solution[]> {
    return this.http.get<Solution[]>(this.testeNewJson);
  }

  getRMs(solution: Solution) {
    let rms: Object[];

    rms = solution.models.filter((d: any) => d.rm == true);

    return rms;
  }
  sortRMBy(array: Object[], by: string): Object[] {
    return array.sort(
      (a: any, b: any) =>
        0 - (a.variables[by].value > b.variables[by].value ? -1 : 1)
    );
  }
}
