import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
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

  multiSolutions =
    'https://run.mocky.io/v3/619b6610-a680-4a31-8d4f-95ffc40105fd';

  constructor(private http: HttpClient) {}

  getSolutions(): Observable<Solution[]> {
    return this.http.get<Solution[]>(this.multiSolutions);
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

  getScatterplotAxis(variables: string[]): string[][] {
    let combine: any = [];
    let variablesQty: number;

    variablesQty = variables.length;

    let matrice: string[][] = [];
    for (let i = 0; i < variablesQty; i++) {
      combine.push(variables.shift());

      matrice = d3.merge([matrice, d3.cross(combine, variables)]);

      combine.pop();
    }

    return matrice;
  }

  getRiskCurveAxis(variables: {}): string[] {
    return Object.keys(variables);
  }
}
