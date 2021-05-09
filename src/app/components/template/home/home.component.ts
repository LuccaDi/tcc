import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { ScaleLinear } from 'd3';
import { Solution } from '../../model/solution.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private selectedSolution: number = 0;
  private data = <Solution>{};
  private solutions: Solution[] = [];
  private scatterplotAxis: string[][] = [];
  private riskCurveAxis: string[] = [];

  private scatterplotsX: ScaleLinear<number, number, never>[] = [];
  private xAxis: any;
  private newScatterplotXScale: ScaleLinear<number, number, never>[] = [];

  private scatterplotsY: ScaleLinear<number, number, never>[] = [];
  private yAxis: any;
  private newScatterplotYScale: ScaleLinear<number, number, never>[] = [];

  private riskCurvesX: ScaleLinear<number, number, never>[] = [];
  private newRiskCurveXScale: ScaleLinear<number, number, never>[] = [];

  private riskCurvesY: ScaleLinear<number, number, never>[] = [];
  private newRiskCurveYScale: ScaleLinear<number, number, never>[] = [];

  private rms: any;
  private attributesKeys: string[] = [];
  private barChartAttributes: any;

  public pen?: number;
  public totalSum?: number;

  private marginAll = 40;

  // private height: any;
  public height: any;

  private width: any;

  private symbol = d3.symbol();

  private columns = 6;
  private rows = 5;

  private size: any;

  private chartColor = '#d3d3d3';
  // private chartColor = 'red';

  constructor(private homeService: HomeService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.solutions = await this.homeService.getData().toPromise();
    this.data = this.solutions[this.selectedSolution];
    this.scatterplotAxis = this.homeService.getScatterplotAxis(
      this.data.fcrossUsed
    );
    this.riskCurveAxis = this.homeService.getRiskCurveAxis(
      this.data.models[0].variables
    );

    this.rms = this.homeService.getRMs(this.data);

    this.pen = this.data.barChart.pen;
    this.totalSum = this.data.barChart.totalSum;

    this.drawScatterplots();
    this.drawRiskCurves();
    this.drawBarChart();
    this.colorCharts();
  }

  //Scatterplots
  private drawScatterplots() {
    let divs;

    let chartWidth: any = document.getElementById('tileCrossPlotRiskCurve')
      ?.clientWidth;

    this.width = chartWidth;

    this.size =
      (this.width - (this.columns + 1) * this.marginAll) / this.columns +
      this.marginAll;

    this.height = this.size * this.rows;

    divs = d3
      .select(`#scatterplots`)
      // .append('div')
      // .style('width', '100%')
      // .selectAll('div')
      .selectAll('svg')
      .data(this.scatterplotAxis)
      // .join('div')
      // .attr('width', this.size)
      // .attr('height', this.size)
      // .append('svg')
      .join('svg')
      .attr('width', this.size)
      .attr('height', this.size)
      // .style('min-width', this.size)
      // .attr('viewBox', `0 0 ${this.size} ${this.size}`)
      .append('g');

    divs
      .append('g')
      .attr('class', 'xAxis')
      .attr('id', (d, i) => `scatterplotXAxis${i}`);

    divs
      .append('g')
      .attr('class', 'yAxis')
      .attr('id', (d, i) => `scatterplotYAxis${i}`);

    divs
      .append('defs')
      .attr('class', 'clips')
      .attr('id', (d, i) => `scatterplotDef${i}`);

    divs
      .append('g')
      .attr('class', 'rects')
      .attr('id', (d, i) => `scatterplotGRect${i}`);

    divs
      .append('g')
      .attr('class', 'dots')
      .attr('id', (d, i) => `scatterplotDots${i}`);

    this.addScatterplotX();
    this.addScatterplotY();
    this.addScatterplotClips();
    this.addScatterplotsRects();
    this.addScatterplotsDots();
  }

  private addScatterplotX() {
    let domain: number[];
    let extentDomain: any;

    this.scatterplotAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((d) => {
        return d.variables[varAxis[0]].value;
      });

      extentDomain = d3.extent(domain);

      this.scatterplotsX[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.marginAll / 2, this.size - this.marginAll / 2]);

      this.xAxis = d3
        .axisBottom(this.scatterplotsX[i])
        .ticks(6, '~s')
        .tickSize(-this.size + this.marginAll);

      this.newScatterplotXScale[i] = this.scatterplotsX[i];

      d3.select(`#scatterplotXAxis${i}`)
        .append('g')
        .attr('id', `scatterplotX${i}`)
        .attr('transform', `translate(0, ${this.size - this.marginAll / 2})`)
        .call(this.xAxis);

      // Axis Title
      d3.select(`#scatterplotXAxis${i}`)
        .append('text')
        .attr('x', this.size / 2)
        .attr('y', this.size)
        .attr('text-anchor', 'middle')
        .text(varAxis[0]);
    });
  }

  private addScatterplotY() {
    let domain: number[];
    let extentDomain: any;

    this.scatterplotAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((d) => {
        return d.variables[varAxis[1]].value;
      });

      extentDomain = d3.extent(domain);

      this.scatterplotsY[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.size - this.marginAll / 2, this.marginAll / 2]);

      this.yAxis = d3
        .axisLeft(this.scatterplotsY[i])
        .ticks(6, '~s')
        .tickSize(-this.size + this.marginAll);

      this.newScatterplotYScale[i] = this.scatterplotsY[i];

      d3.select(`#scatterplotYAxis${i}`)
        .append('g')
        .attr('id', `scatterplotY${i}`)
        .attr('transform', `translate(${this.marginAll / 2}, 0)`)
        .call(this.yAxis);

      // Axis Title
      d3.select(`#scatterplotYAxis${i}`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.size / 2)
        .attr('y', this.marginAll / 2)
        .text(varAxis[1]);
    });
  }

  private addScatterplotClips() {
    this.scatterplotAxis.forEach((d, i) => {
      d3.select(`#scatterplotDef${i}`)
        .append('clipPath')
        .attr('id', `scatterplotClip${i}`)
        .append('rect')
        .attr('x', this.marginAll / 2)
        .attr('y', this.marginAll / 2)
        .attr('width', this.size - this.marginAll)
        .attr('height', this.size - this.marginAll);
    });
  }

  private addScatterplotsRects() {
    let id: number;
    let url: string;
    let features: string =
      'width=900, height=650,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    const zoom: any = d3
      .zoom()
      // .scaleExtent([0.5, 5])
      // .translateExtent([
      //   [0, 0],
      //   [this.width, this.height],
      // ])
      .on('zoom', (transform) => this.scatterplotZoomed(transform, id));

    this.scatterplotAxis.forEach((d, i) => {
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/expandChart/${i}`])
      );

      //add expand button
      d3.select(`#scatterplotGRect${i}`)
        .append('a')
        // .attr('id', `btn${i}`)
        // .attr(
        //   'transform',
        //   'translate(' +
        //     ((col + 1) * this.size - this.marginAll) +
        //     ',' +
        //     row * this.size +
        //     ')'
        // )
        .attr('href', '')
        .attr(
          'onclick',
          `window.open('${url}', '_blank', '${features}'); return false;`
        )
        .append('image')
        .attr('height', '20px')
        .attr('width', '20px')
        .attr(
          'href',
          '../../../../assets/img/outline_open_in_new_black_24dp.png'
        );

      d3.select(`#scatterplotGRect${i}`)
        .append('rect')
        // .attr('col', col)
        // .attr('row', row)
        // .attr(
        //   'transform',
        //   'translate(' + col * this.size + ',' + row * this.size + ')'
        // )
        .attr('fill', '#FFFFFF')
        .attr('fill-opacity', '0.0')
        .attr('x', this.marginAll / 2)
        .attr('y', this.marginAll / 2)
        .attr('width', this.size - this.marginAll)
        .attr('height', this.size - this.marginAll)
        .attr('id', () => `#scatterplotRect${i}`)
        .on('mouseover', function () {
          id = i;
        })
        .call(zoom);
    });
  }

  private addScatterplotsDots() {
    this.scatterplotAxis.forEach((axis, axisIndex) => {
      d3.select(`#scatterplotDots${axisIndex}`)
        // .append('g');
        // .attr(
        //   'transform',
        //   'translate(' + col * this.size + ',' + row * this.size + ')'
        // );
        .attr('clip-path', () => `url(#scatterplotClip${axisIndex})`)
        .selectAll('path')
        .data(this.data.models)
        .join('path')
        .attr('id', (model) => model.id)
        .attr('class', 'model')
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return d3.symbolSquare;
              } else if (model.rm == true) {
                return d3.symbolDiamond;
              } else {
                return d3.symbolCircle;
              }
            })
            .size(50)
        )
        .attr('transform', (model) => {
          return (
            'translate(' +
            this.scatterplotsX[axisIndex](model.variables[axis[0]].value) +
            ',' +
            this.scatterplotsY[axisIndex](model.variables[axis[1]].value) +
            ')'
          );
        })
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return 'red';
          } else if (model.rm == true) {
            return 'green';
          } else {
            return '#a28ad2';
          }
        })
        .on('click', (modelClicked) => {
          this.brushing(modelClicked);
        });
    });
  }

  private scatterplotZoomed = ({ transform }: any, id: number) => {
    this.newScatterplotXScale[id] = transform
      .rescaleX(this.scatterplotsX[id])
      .interpolate(d3.interpolateRound);
    this.newScatterplotYScale[id] = transform
      .rescaleY(this.scatterplotsY[id])
      .interpolate(d3.interpolateRound);

    d3.select(`#scatterplotX${id}`).call(
      this.xAxis.scale(this.newScatterplotXScale[id])
    );

    d3.select(`#scatterplotY${id}`).call(
      this.yAxis.scale(this.newScatterplotYScale[id])
    );

    d3.select(`#scatterplotDots${id}`).attr(
      'transform',
      'translate(' +
        transform.x +
        ',' +
        transform.y +
        ') scale(' +
        transform.k +
        ')'
    );

    d3.select(`#scatterplotDots${id}`)
      .selectAll('.model')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select(`#scatterplotClip${id}`)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginAll / 2 - transform.x)
      .attr('y', this.marginAll / 2 - transform.y);

    d3.select(`#scatterplotDots${id}`)
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.size - this.marginAll / 2 - transform.y) / transform.k) // y position of the first end of the line
      .attr('y2', (this.marginAll / 2 - transform.y) / transform.k); // y position of the second end of the line

    d3.select(`#scatterplotDots${id}`)
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.marginAll / 2 - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.size - this.marginAll / 2 - transform.x) / transform.k); // y position of the second end of the line

    this.colorCharts();
  };

  //Risk Curves
  private drawRiskCurves() {
    let divs;

    divs = d3
      .select(`#riskCurves`)
      .append('div')
      .selectAll('svg')
      .data(this.riskCurveAxis)
      .join('svg')
      .attr('width', this.size)
      .attr('height', this.size)
      .append('g');

    divs
      .append('g')
      .attr('class', 'xAxis')
      .attr('id', (d, i) => `riskCurveXAxis${i}`);

    divs
      .append('g')
      .attr('class', 'yAxis')
      .attr('id', (d, i) => `riskCurveYAxis${i}`);

    divs
      .append('defs')
      .attr('class', 'clips')
      .attr('id', (d, i) => `riskCurveDef${i}`);

    divs
      .append('g')
      .attr('class', 'rects')
      .attr('id', (d, i) => `riskCurveRect${i}`);

    divs
      .append('g')
      .attr('class', 'dots')
      .attr('id', (d, i) => `riskCurveDots${i}`);

    this.addRiskCurveX();
    this.addRiskCurveY();
    this.addRiskCurveClips();
    this.addRiskCurvesRects();
    this.addRiskCurvesDots();
    this.drawRiskCurveLines();
  }

  private addRiskCurveX() {
    let domain: number[];
    let extentDomain: any;

    this.riskCurveAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((d) => {
        return d.variables[varAxis].value;
      });

      extentDomain = d3.extent(domain);

      this.riskCurvesX[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.marginAll / 2, this.size - this.marginAll / 2]);

      this.xAxis = d3
        .axisBottom(this.riskCurvesX[i])
        .ticks(6, '~s')
        .tickSize(-this.size + this.marginAll);

      this.newRiskCurveXScale[i] = this.riskCurvesX[i];

      d3.select(`#riskCurveXAxis${i}`)
        .append('g')
        .attr('id', `riskCurveX${i}`)
        .attr('transform', `translate(0, ${this.size - this.marginAll / 2})`)
        .call(this.xAxis);

      // Axis Title
      d3.select(`#riskCurveXAxis${i}`)
        .append('text')
        .attr('x', this.size / 2)
        .attr('y', this.size)
        .attr('text-anchor', 'middle')
        .text(varAxis);
    });
  }

  private addRiskCurveY() {
    let extentDomain: number[];

    this.riskCurveAxis.forEach((varAxis, i) => {
      extentDomain = [0, 1];

      this.riskCurvesY[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.size - this.marginAll / 2, this.marginAll / 2]);

      this.yAxis = d3
        .axisLeft(this.riskCurvesY[i])
        .ticks(6, '~s')
        .tickSize(-this.size + this.marginAll);

      this.newRiskCurveYScale[i] = this.riskCurvesY[i];

      d3.select(`#riskCurveYAxis${i}`)
        .append('g')
        .attr('id', `riskCurveY${i}`)
        .attr('transform', `translate(${this.marginAll / 2}, 0)`)
        .call(this.yAxis);

      // Axis Title
      d3.select(`#riskCurveYAxis${i}`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.size / 2)
        .attr('y', this.marginAll / 2)
        .text(`C. Probability`);
    });
  }

  private addRiskCurveClips() {
    this.riskCurveAxis.forEach((d, i) => {
      d3.select(`#riskCurveDef${i}`)
        .append('clipPath')
        .attr('id', `riskCurveClip${i}`)
        .append('rect')
        .attr('x', this.marginAll / 2)
        .attr('y', this.marginAll / 2)
        .attr('width', this.size - this.marginAll)
        .attr('height', this.size - this.marginAll);
    });
  }

  private addRiskCurvesRects() {
    let id: number;
    let url: string;
    let features: string =
      'width=900, height=650,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    const zoom: any = d3
      .zoom()
      // .scaleExtent([0.5, 5])
      // .translateExtent([
      //   [0, 0],
      //   [this.width, this.height],
      // ])
      .on('zoom', (transform) => this.riskCurveZoomed(transform, id));

    this.riskCurveAxis.forEach((d, i) => {
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/expandChart/${i}`])
      );

      //add expand button
      d3.select(`#riskCurveRect${i}`)
        .append('a')
        // .attr('id', `btn${i}`)
        // .attr(
        //   'transform',
        //   'translate(' +
        //     ((col + 1) * this.size - this.marginAll) +
        //     ',' +
        //     row * this.size +
        //     ')'
        // )
        .attr('href', '')
        .attr(
          'onclick',
          `window.open('${url}', '_blank', '${features}'); return false;`
        )
        .append('image')
        .attr('height', '20px')
        .attr('width', '20px')
        .attr(
          'href',
          '../../../../assets/img/outline_open_in_new_black_24dp.png'
        );

      d3.select(`#riskCurveRect${i}`)
        .append('rect')
        // .attr('col', col)
        // .attr('row', row)
        // .attr(
        //   'transform',
        //   'translate(' + col * this.size + ',' + row * this.size + ')'
        // )
        .attr('fill', '#FFFFFF')
        .attr('fill-opacity', '0.0')
        .attr('x', this.marginAll / 2)
        .attr('y', this.marginAll / 2)
        .attr('width', this.size - this.marginAll)
        .attr('height', this.size - this.marginAll)
        // .attr('id', () => i)
        .on('mouseover', function () {
          id = i;
        })
        .call(zoom);
    });
  }

  private addRiskCurvesDots() {
    this.riskCurveAxis.forEach((axis, axisIndex) => {
      d3.select(`#riskCurveDots${axisIndex}`)
        // .append('g');
        // .attr(
        //   'transform',
        //   'translate(' + col * this.size + ',' + row * this.size + ')'
        // );
        .attr('clip-path', () => `url(#riskCurveClip${axisIndex})`)
        .selectAll('path')
        .data(this.data.models)
        .join('path')
        .attr('id', (model) => model.id)
        // .attr('class', 'dot')
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return d3.symbolSquare;
              } else if (model.rm == true) {
                return d3.symbolDiamond;
              } else {
                return d3.symbolCircle;
              }
            })
            .size(50)
        )
        .attr(
          'transform',
          (model) =>
            'translate(' +
            this.riskCurvesX[axisIndex](model.variables[axis].value) +
            ',' +
            this.riskCurvesY[axisIndex](model.variables[axis].cprob) +
            ')'
        )
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return 'red';
          } else if (model.rm == true) {
            return 'green';
          } else {
            return '#a28ad2';
          }
        })
        .on('click', (modelClicked) => {
          this.brushing(modelClicked);
        });
    });
  }

  private drawRiskCurveLines() {
    let sortedRMs: Object[];

    this.riskCurveAxis.forEach((axis, axisIndex) => {
      let cumulativeProb: number = 1;
      let previousRM: any;
      sortedRMs = this.homeService.sortRMBy(this.rms, axis);

      sortedRMs.forEach((rm: any, rmIndex) => {
        //vertical lines
        d3.select(`#riskCurveDots${axisIndex}`)
          .append('line')
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .attr('x1', () => {
            return this.riskCurvesX[axisIndex](rm.variables[axis].value);
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.riskCurvesY[axisIndex](cumulativeProb);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.riskCurvesX[axisIndex](rm.variables[axis].value);
          }) // x position of the second end of the line
          .attr('y2', () => {
            cumulativeProb -= rm.cprobRM;
            return this.riskCurvesY[axisIndex](cumulativeProb);
          }); // y position of the second end of the line

        //horizontal lines
        if (rmIndex == 0) {
          return;
        }
        previousRM = sortedRMs[rmIndex - 1];
        d3.select(`#riskCurveDots${axisIndex}`)
          .append('line')
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .attr('x1', () => {
            return this.riskCurvesX[axisIndex](
              previousRM.variables[axis].value
            );
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.riskCurvesY[axisIndex](cumulativeProb + rm.cprobRM);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.riskCurvesX[axisIndex](rm.variables[axis].value);
          }) // x position of the second end of the line
          .attr('y2', () => {
            return this.riskCurvesY[axisIndex](cumulativeProb + rm.cprobRM);
          }); // y position of the second end of the line
      });
    });
  }

  private riskCurveZoomed = ({ transform }: any, id: number) => {
    this.newRiskCurveXScale[id] = transform
      .rescaleX(this.riskCurvesX[id])
      .interpolate(d3.interpolateRound);
    this.newRiskCurveYScale[id] = transform
      .rescaleY(this.riskCurvesY[id])
      .interpolate(d3.interpolateRound);

    d3.select(`#riskCurveX${id}`).call(
      this.xAxis.scale(this.newRiskCurveXScale[id])
    );

    d3.select(`#riskCurveY${id}`).call(
      this.yAxis.scale(this.newRiskCurveYScale[id])
    );

    d3.select(`#riskCurveDots${id}`).attr(
      'transform',
      'translate(' +
        transform.x +
        ',' +
        transform.y +
        ') scale(' +
        transform.k +
        ')'
    );

    d3.select(`#riskCurveDots${id}`)
      .selectAll('.model')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select(`#riskCurveClip${id}`)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginAll / 2 - transform.x)
      .attr('y', this.marginAll / 2 - transform.y);

    d3.select(`#riskCurveDots${id}`)
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.size - this.marginAll / 2 - transform.y) / transform.k) // y position of the first end of the line
      .attr('y2', (this.marginAll / 2 - transform.y) / transform.k); // y position of the second end of the line

    d3.select(`#riskCurveDots${id}`)
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.marginAll / 2 - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.size - this.marginAll / 2 - transform.x) / transform.k); // y position of the second end of the line

    //Resize risk curve lines
    d3.select(`#riskCurveDots${id}`)
      .selectAll('.riskCurveLines')
      .style('stroke-width', 1.5 / transform.k);

    this.colorCharts();
  };

  //Bar Chart
  private drawBarChart() {
    const barHeight: string = '20px';
    this.barChartAttributes = this.data.barChart.attributes;

    this.attributesKeys = Object.keys(this.barChartAttributes);

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChart`)
      .selectAll('div')
      .data(this.attributesKeys)
      .join('div')
      .attr('id', (d, i) => `attribute${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d, i) => this.attributesKeys[i].toUpperCase());

    this.attributesKeys.map((data: any, index) => {
      d3.select(`#attribute${index}`)
        .append('div')
        .selectAll('svg')
        .data(this.barChartAttributes[data].difference)
        .join('svg')
        .attr('id', (d, i) => data + i)
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', 'solid medium grey')
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', barHeight);
    });
  }

  public openBarChartNewWindow() {
    let url: string;

    url = this.router.serializeUrl(
      this.router.createUrlTree([`/expandBarChart/${this.selectedSolution}`])
    );

    let features =
      'width=1370, height=550,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    window.open(url, '_blank', features);
    return false;
  }

  //Shared
  private brushing(modelClicked: any) {
    this.clearSelection();

    let modelId = modelClicked.srcElement.attributes.id.value;

    this.data.models.forEach((model: any) => {
      if (model.id == modelId) {
        //ScatteplotBrushing
        this.scatterplotAxis.forEach((axis, axisIndex) => {
          //vertical lines
          d3.selectAll(`#scatterplotDots${axisIndex}`)
            .append('line')
            .attr('id', 'x')
            .attr('class', 'brushing')
            .style('stroke', 'red') // colour the line
            .style('stroke-width', 1.5)
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
            .attr('x1', () =>
              this.scatterplotsX[axisIndex](model.variables[axis[0]].value)
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.scatterplotsY[axisIndex](
                this.newScatterplotYScale[axisIndex].domain()[0]
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.scatterplotsX[axisIndex](model.variables[axis[0]].value)
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.scatterplotsY[axisIndex](
                this.newScatterplotYScale[axisIndex].domain()[1]
              )
            ); // y position of the second end of the line

          //horizontal lines
          d3.selectAll(`#scatterplotDots${axisIndex}`)
            .append('line')
            .attr('id', 'y')
            .attr('class', 'brushing')
            .style('stroke', 'red') // colour the line
            .style('stroke-width', 1.5)
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
            .attr('x1', () =>
              this.scatterplotsX[axisIndex](
                this.newScatterplotXScale[axisIndex].domain()[0]
              )
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.scatterplotsY[axisIndex](model.variables[axis[1]].value)
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.scatterplotsX[axisIndex](
                this.newScatterplotXScale[axisIndex].domain()[1]
              )
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.scatterplotsY[axisIndex](model.variables[axis[1]].value)
            ); // y position of the second end of the line
        });

        //Risk Curve Brushing
        this.riskCurveAxis.forEach((axis, axisIndex) => {
          //vertical lines
          d3.selectAll(`#riskCurveDots${axisIndex}`)
            .append('line')
            .attr('id', 'x')
            .attr('class', 'brushing')
            .style('stroke', 'red') // colour the line
            .style('stroke-width', 1.5)
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
            .attr('x1', () =>
              this.riskCurvesX[axisIndex](model.variables[axis].value)
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.riskCurvesY[axisIndex](
                this.newRiskCurveYScale[axisIndex].domain()[0]
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.riskCurvesX[axisIndex](model.variables[axis].value)
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.riskCurvesY[axisIndex](
                this.newRiskCurveYScale[axisIndex].domain()[1]
              )
            ); // y position of the second end of the line

          //horizontal lines
          d3.selectAll(`#riskCurveDots${axisIndex}`)
            .append('line')
            .attr('id', 'y')
            .attr('class', 'brushing')
            .style('stroke', 'red') // colour the line
            .style('stroke-width', 1.5)
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
            .attr('x1', () =>
              this.riskCurvesX[axisIndex](
                this.newRiskCurveXScale[axisIndex].domain()[0]
              )
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.riskCurvesY[axisIndex](model.variables[axis].cprob)
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.riskCurvesX[axisIndex](
                this.newRiskCurveXScale[axisIndex].domain()[1]
              )
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.riskCurvesY[axisIndex](model.variables[axis].cprob)
            ); // y position of the second end of the line
        });

        //bar chart brushing
        this.attributesKeys.map((tempD) => {
          d3.select(`#${tempD + model.attributes[tempD]}`)
            .style('background-color', 'lightblue')
            .style('border', 'solid medium green');
        });
      }
    });
  }

  private colorCharts() {
    d3.selectAll('.xAxis')
      .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.selectAll('.xAxis')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.selectAll('.xAxis')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);
    // d3.select('.xAxis').selectAll('text').attr('fill', this.chartColor);

    d3.selectAll('.yAxis')
      .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.selectAll('.yAxis')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.selectAll('.yAxis')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);
  }

  public clearSelection() {
    d3.selectAll('.brushing').remove();

    this.attributesKeys.map((tempD, index) => {
      d3.select(`#attribute${index}`)
        .selectAll('svg')
        .style('background-color', '')
        .style('border', 'solid medium grey');
    });
  }
}
