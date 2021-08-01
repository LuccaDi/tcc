import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Observable } from 'rxjs/internal/Observable';
import { Solution } from '../model/solution.model';

export interface cumulatveProb {
  ids: number[];
  models: number[];
}
@Injectable({
  providedIn: 'root',
})
export class HomeService {
  // baseURL = 'https://run.mocky.io/v3/74cd378b-e49f-4592-98ec-4ae8c71697d3';

  // testeLinesRiskURL =
  //   'https://run.mocky.io/v3/6db2582c-6eee-4243-a13c-ab82b77c4e14';

  // testeNewJson = 'https://run.mocky.io/v3/67e9a971-49f2-4b34-ab1a-b33a7e097b6e';

  // multiSolutions =
  //   'https://run.mocky.io/v3/fc29c6bf-6dae-4142-b982-a191ccd14cf5';

  // refactorModel =
  //   'https://run.mocky.io/v3/dc105ee6-0982-44c6-8e26-0e27d9d04fdb';

  cprobRMModel = 'https://run.mocky.io/v3/d87d8109-8a36-4e77-85c6-ee30425f63b6';

  constructor(private http: HttpClient) {}

  async getTeste(file: File): Promise<Solution[]> {
    let resultado: any;
    let solutions: Solution[] = [];

    return new Promise<Solution[]>((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        resultado = reader.result;

        solutions = JSON.parse(resultado);

        resolve(solutions);
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  getSolutions(): Observable<Solution[]> {
    // console.log(this.http.get<Solution[]>(this.refactorModel));

    return this.http.get<Solution[]>(this.cprobRMModel);
  }

  getRMs(solution: Solution) {
    let rms: Object[];

    rms = solution.models.filter((d: any) => d.rm == true);

    return rms;
  }

  sortRMBy(array: Object[], by: string): Object[] {
    let sorted = array.sort((a: any, b: any) => {
      if (
        a.variables.find((variable: any) => variable.name == by)?.value >
        b.variables.find((variable: any) => variable.name == by)?.value
      ) {
        return 1;
      } else if (
        a.variables.find((variable: any) => variable.name == by)?.value <
        b.variables.find((variable: any) => variable.name == by)?.value
      ) {
        return -1;
      } else {
        if (a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      }
    });

    return sorted;
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

  getRiskCurveAxis(variables: any[]): string[] {
    return variables.map((variable) => variable.name);
  }

  getCprobsRms(numRiskCurvesAxis: number, numRMs: number) {
    let cprobsRMs: cumulatveProb[] = [];
    let modelsRM: number[] = [];
    let cprob = {} as cumulatveProb;
    let idsArray: number[] = [];

    for (let j = 0; j < numRMs; j++) {
      modelsRM.push(0);
      idsArray.push(0);
    }

    for (let i = 0; i < numRiskCurvesAxis; i++) {
      cprob.models = modelsRM;
      cprob.ids = idsArray;
      cprobsRMs.push(cprob);
    }

    return cprobsRMs;
  }
}
