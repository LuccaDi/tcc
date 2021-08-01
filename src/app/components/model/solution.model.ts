export interface Solution {
  fcrossUsed: string[];
  barChart: {
    pen: number;
    totalSum: number;
    attributes: {
      name: string;
      original: number[];
      rmFinder: number[];
      difference: number[];
      sum: number;
    }[];
  };
  models: {
    predefined: boolean;
    rm: boolean;
    id: number;
    attributes: {
      name: string;
      value: number;
    }[];
    variables: {
      name: string;
      value: number;
      cprob: number;
      cprobRM?: number;
    }[];
  }[];
}

// export interface Solution {
//   fcrossUsed: string[];
//   barChart: {
//     pen: number;
//     totalSum: number;
//     attributes: {
//       name: string;
//       original: number[];
//       rmFinder: number[];
//       difference: number[];
//       sum: number;
//     }[];
//   };
//   models: {
//     predefined: boolean;
//     rm: boolean;
//     id: number;
//     cprobRM?: number;
//     attributes: {
//       name: string;
//       value: number;
//     }[];
//     variables: {
//       name: string;
//       value: number;
//       cprob: number;
//     }[];
//   }[];
// }
