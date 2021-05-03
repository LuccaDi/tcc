export interface Solution {
  fcrossUsed: string[];
  barChart: {
    pen: number;
    totalSum: number;
    attributes: {
      [key: string]: {
        original: number[];
        rmFinder: number[];
        difference: number[];
        sum: number;
      };
    };
  };
  models: {
    predefined: boolean;
    rm: boolean;
    id: number;
    cprobRM?: number;
    attributes: {
      [key: string]: number;
    };
    variables: {
      [key: string]: {
        value: number;
        cprob: number;
      };
    };
  }[];
}

// export interface Chart {
//   predefined: boolean;
//   rm: boolean;
//   id: number;
//   cprobRM?: number;
//   multIP: number;
//   pvt: number;
//   geo: number;
//   variables: {
//     [key: string]: {
//       value: number;
//       cprob: number;
//     };
//   };
// }

// export interface Chart {
//   predefined: boolean;
//   rm: boolean;
//   id: number;
//   cprobRM?: number;
//   multIP: number;
//   pvt: number;
//   geo: number;
//   cRocha: {
//     value: number;
//     cprob: number;
//   };
//   nkrg1: {
//     value: number;
//     cprob: number;
//   };
//   nkrog1: {
//     value: number;
//     cprob: number;
//   };
//   nkrow1: {
//     value: number;
//     cprob: number;
//   };
//   nkrow2: {
//     value: number;
//     cprob: number;
//   };
//   nkrw1: {
//     value: number;
//     cprob: number;
//   };
//   npcow1: {
//     value: number;
//     cprob: number;
//   };
//   krgSor1: {
//     value: number;
//     cprob: number;
//   };
//   kroSwi1: {
//     value: number;
//     cprob: number;
//   };
//   krwSor1: {
//     value: number;
//     cprob: number;
//   };
//   kvkh: {
//     value: number;
//     cprob: number;
//   };
//   kFrat: {
//     value: number;
//     cprob: number;
//   };
//   dwoc: {
//     value: number;
//     cprob: number;
//   };
//   sgc1: {
//     value: number;
//     cprob: number;
//   };
//   sor1: {
//     value: number;
//     cprob: number;
//   };
//   swi1: {
//     value: number;
//     cprob: number;
//   };
//   npAt: {
//     value: number;
//     cprob: number;
//   };
//   wpAt: {
//     value: number;
//     cprob: number;
//   };
//   voip: {
//     value: number;
//     cprob: number;
//   };
//   fro: {
//     value: number;
//     cprob: number;
//   };
// }
