import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { line } from 'd3';
import { Chart } from '../../model/chart.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private data: Chart[] = [];
  private rms: Chart[] = [];
  private svg: any;
  private charts: any;
  private rects: any;

  private marginAll = 30;

  // private height: any;
  public height: any;

  private width: any;

  private symbol = d3.symbol();

  private columns = 6;
  private rows = 5;
  private numCharts = 26;

  private eixosX = [
    'cRocha',
    'cRocha',
    'cRocha',
    'nkrg1',
    'nkrg1',
    'nkrog1',
    'cRocha',
    'nkrg1',
    'nkrog1',
    'nkrow1',
    'nkrow2',
    'nkrw1',
    'npcow1',
    'krgSor1',
    'kroSwi1',
    'krwSor1',
    'kvkh',
    'kFrat',
    'dwoc',
    'sgc1',
    'sor1',
    'swi1',
    'npAt',
    'wpAt',
    'voip',
    'fro',
  ];
  private eixosY = ['nkrg1', 'nkrog1', 'nkrow1', 'nkrog1', 'nkrow1', 'nkrow1'];

  private x: any = [];
  private y: any = [];

  private newXScale: any = [];
  private newYScale: any = [];

  private xAxis: any;
  private yAxis: any;

  private tempGx: any;
  private tempGy: any;

  private def: any;

  private size: any;

  private chartColor = '#d3d3d3';
  // private chartColor = 'red';

  constructor(private homeService: HomeService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.data = await this.homeService.getData().toPromise();
    this.rms = await this.homeService.getRMs();

    this.drawPlot();
    this.addDots();
    this.colorCharts();
    this.drawRiskCurveLines();
    this.drawBarChart();
  }

  private drawPlot(): void {
    // const symbol = d3.symbol();

    // let chartWidth: any = document.getElementById('gridCharts');
    let chartWidth: any = document.getElementById('tileCrossPlotRiskCurve')
      ?.clientWidth;

    // let home: any = document.getElementById('home');

    // this.width = home?.offsetWidth - this.marginAll * 2;
    // this.width = chartWidth - this.marginAll * 2;
    this.width = chartWidth;

    this.size =
      (this.width - (this.columns + 1) * this.marginAll) / this.columns +
      this.marginAll;

    // this.height = this.size * this.rows - this.marginAll * 2;
    this.height = this.size * this.rows;

    this.svg = d3
      // .select('figure#home')
      .select('#crossPlotRiskCurveCharts')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      // .append('svg')
      // .attr('id', 'main')
      // .attr('width', this.width + this.marginAll * 2)
      // .attr('height', this.height + this.marginAll * 2)
      .select('g')
      // .attr('transform', 'translate(' + this.marginAll + ',' + 0 + ')')
      .attr('transform', 'translate(' + this.marginAll / 2 + ',' + 0 + ')')
      .attr('class', 'content');
    // .call(zoom);

    this.tempGx = this.svg.append('g').attr('class', 'xAxis');

    this.addX();

    this.tempGy = this.svg.append('g').attr('class', 'yAxis');
    this.addY();

    this.def = this.svg.append('defs');

    this.addClip();

    this.rects = this.svg.append('g').attr('class', 'rects');

    this.charts = this.svg.append('g').attr('class', 'charts');

    this.addCharts();

    this.addRect();

    // Add labels
    // dots
    //   .selectAll('text')
    //   .data(this.data)
    //   .enter()
    //   .append('text')
    //   .text((d: any) => d.id)
    //   .attr('x', (d: any) => x(d.cRocha))
    //   .attr('y', (d: any) => y(d.nkrg1));
  }

  private addX() {
    let chart = 0;
    let domain;
    let extentDomain: any;

    for (let row = 1; row <= this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (chart >= this.numCharts) {
          return;
        }

        domain = this.data.map((d: any) => {
          return d[this.eixosX[chart]].value;
        });

        extentDomain = d3.extent(domain);

        this.x[chart] = d3
          .scaleLinear()
          .domain(extentDomain)
          .range([this.marginAll / 2, this.size - this.marginAll / 2]);

        this.xAxis = d3
          .axisBottom(this.x[chart])
          .ticks(6, '~s')
          .tickSize(-this.size + this.marginAll);

        this.newXScale[chart] = this.x[chart];

        // selectAll('.x-axis')
        this.tempGx
          .append('g')
          .attr('id', 'x' + chart)
          .attr(
            'transform',
            'translate(' +
              col * this.size +
              ',' +
              (this.size * row - this.marginAll / 2) +
              ')'
          )
          .call(this.xAxis);
        // .call((g: any) => g.select('.domain').remove());
        // .call((g) => g.selectAll('.tick line').attr('stroke', '#ddd'));

        //Axis Title
        // this.tempGx
        //   .append('text')
        //   .attr('text-anchor', 'start')
        //   .attr('x', col * this.size)
        //   .attr('y', this.size * row)
        //   .text('X axis title');

        chart++;
      }
    }
  }

  private addY() {
    let chart = 0;
    let domain;
    let extentDomain: any;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (chart >= this.numCharts) {
          return;
        } else if (chart < 6) {
          domain = this.data.map((d: any) => {
            return d[this.eixosY[chart]].value;
          });

          extentDomain = d3.extent(domain);
        } else {
          extentDomain = [0, 1];
        }

        this.y[chart] = d3
          .scaleLinear()
          .domain(extentDomain)
          // .domain([0, 1])
          .range([this.size - this.marginAll / 2, this.marginAll / 2]);

        this.yAxis = d3
          .axisLeft(this.y[chart])
          .ticks(6)
          .tickSize(-this.size + this.marginAll);

        this.newYScale[chart] = this.y[chart];

        // selectAll('.y-axis')
        this.tempGy
          .append('g')
          .attr('id', 'y' + chart)
          .attr(
            'transform',
            'translate(' +
              (this.marginAll / 2 + this.size * col) +
              ',' +
              row * this.size +
              ')'
          )
          .call(this.yAxis);
        // .call((g) => g.select('.domain').remove())
        // .call((g) => g.selectAll('.tick line').attr('stroke', '#ddd'));

        chart++;
      }
    }
  }

  private zoomed = ({ transform }: any, id: number) => {
    let row: any = document.getElementById('' + id)?.getAttribute('row');
    let col: any = document.getElementById('' + id)?.getAttribute('col');

    this.newXScale[id] = transform
      .rescaleX(this.x[id])
      .interpolate(d3.interpolateRound);
    this.newYScale[id] = transform
      .rescaleY(this.y[id])
      .interpolate(d3.interpolateRound);

    this.tempGx.select('#x' + id).call(this.xAxis.scale(this.newXScale[id]));

    this.tempGy.select('#y' + id).call(this.yAxis.scale(this.newYScale[id]));

    this.charts.select('#chart' + id).attr(
      'transform',

      'translate(' +
        (col * this.size + transform.x) +
        ',' +
        (row * this.size + transform.y) +
        ') scale(' +
        transform.k +
        ')'
    );

    d3.select('#chart' + id)
      .selectAll('.dot')
      .attr('d', this.symbol.size(50 / transform.k));

    this.def
      .select('#clip' + id)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginAll / 2 - transform.x)
      .attr('y', this.marginAll / 2 - transform.y);

    d3.select('#chart' + id)
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.size - this.marginAll / 2 - transform.y) / transform.k) // y position of the first end of the line
      .attr('y2', (this.marginAll / 2 - transform.y) / transform.k); // y position of the second end of the line

    d3.select('#chart' + id)
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.marginAll / 2 - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.size - this.marginAll / 2 - transform.x) / transform.k); // y position of the second end of the line

    //Resize risk curve lines
    d3.select('#chart' + id)
      .selectAll('.riskCurveLines')
      .style('stroke-width', 1.5 / transform.k);

    this.colorCharts();
  };

  private addCharts() {
    let chart = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (chart >= this.numCharts) {
          return;
        }
        this.charts
          // .selectAll('g')
          .append('g')
          .attr(
            'transform',
            'translate(' + col * this.size + ',' + row * this.size + ')'
          );

        chart++;
      }
    }
  }

  private addClip() {
    let chart = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (chart >= this.numCharts) {
          return;
        }

        this.def
          .append('clipPath')
          .attr('id', 'clip' + chart)
          .append('rect')
          .attr('x', this.marginAll / 2)
          .attr('y', this.marginAll / 2)
          .attr('width', this.size - this.marginAll)
          .attr('height', this.size - this.marginAll);

        chart++;
      }
    }
  }

  private addRect() {
    let i = 0;
    let chart = 0;

    let id: number;

    let url: string;

    let features =
      'width=900, height=650,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    const zoom: any = d3
      .zoom()
      // .scaleExtent([0.5, 5])
      // .translateExtent([
      //   [0, 0],
      //   [this.width, this.height],
      // ])
      .on('zoom', (transform) => this.zoomed(transform, id));

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (chart >= this.numCharts) {
          return;
        }

        url = this.router.serializeUrl(
          this.router.createUrlTree([`/expandChart/${chart}`])
        );

        //add expand button
        this.rects
          .append('a')
          .attr('id', 'btn' + chart)
          .attr(
            'transform',
            'translate(' +
              ((col + 1) * this.size - this.marginAll) +
              ',' +
              row * this.size +
              ')'
          )
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

        this.rects
          // .selectAll('rect')
          .append('rect')
          .attr('col', col)
          .attr('row', row)
          .attr(
            'transform',
            'translate(' + col * this.size + ',' + row * this.size + ')'
          )
          .attr('fill', '#FFFFFF')
          .attr('fill-opacity', '0.0')
          // .attr('stroke', '#aaa')
          .attr('x', this.marginAll / 2)
          .attr('y', this.marginAll / 2)
          .attr('width', this.size - this.marginAll)
          .attr('height', this.size - this.marginAll)
          .attr('id', () => i++)
          // .call(zoom);
          .on('mouseover', function (d: any) {
            id = d.srcElement.id;
          })
          // .on('wheel', function (d: any) {
          //   id = d.srcElement.id;
          // })
          .call(zoom);

        chart++;
      }
    }
  }

  private addDots() {
    let chart = -1;
    let g = 0;
    let c = 0;

    this.charts
      .selectAll('g')
      .attr('id', () => 'chart' + g++)
      .attr('clip-path', () => `url(#clip${c++})`)
      .selectAll('path')
      .data(this.data)
      .join('path')
      .attr('id', (d: any) => d.id)
      .attr('class', 'dot')
      .attr(
        'd',
        this.symbol
          .type((d: any) => {
            if (d.predefined == true) {
              return d3.symbolSquare;
            } else if (d.rm == true) {
              return d3.symbolDiamond;
            } else {
              return d3.symbolCircle;
            }
          })
          .size(50)
      )
      .attr('transform', (d: any, i: any) => {
        // console.log(d);

        if (i == 0) {
          // console.log('i: ' + i);
          chart++;
          // console.log('chart: ' + chart);
        }
        if (chart < 6) {
          return (
            'translate(' +
            this.x[chart](d[this.eixosX[chart]].value) +
            ',' +
            this.y[chart](d[this.eixosY[chart]].value) +
            ')'
          );
        } else {
          return (
            'translate(' +
            this.x[chart](d[this.eixosX[chart]].value) +
            ',' +
            this.y[chart](d[this.eixosX[chart]].cprob) +
            ')'
          );
        }
      })
      .attr('fill', (d: any) => {
        if (d.predefined == true) {
          return 'red';
        } else if (d.rm == true) {
          return 'green';
        } else {
          return '#a28ad2';
        }
      })
      .on('click', (d: any) => {
        let chart = 0;

        let lineX;
        let lineY;

        let dotId = d.srcElement.attributes.id.value;

        this.data.map((data: any) => {
          if (data.id == dotId) {
            this.charts.selectAll('g').selectAll('.brushing').remove();

            this.charts
              .selectAll('g')
              .append('line')
              .attr('id', 'x')
              .attr('class', 'brushing')
              .style('stroke', 'red') // colour the line
              .style('stroke-width', 1.5)
              .style('stroke-linejoin', 'round')
              .style('stroke-linecap', 'round')
              .attr('x1', () => {
                lineX = this.eixosX[chart];

                return this.x[chart++](data[lineX].value);
              }) // x position of the first end of the line
              .attr('y1', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                return this.y[chart](this.newYScale[chart++].domain()[0]);
              }) // y position of the first end of the line
              .attr('x2', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                lineX = this.eixosX[chart];

                return this.x[chart++](data[lineX].value);
              }) // x position of the second end of the line
              .attr('y2', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                return this.y[chart](this.newYScale[chart++].domain()[1]);
              }); // y position of the second end of the line

            this.charts
              .selectAll('g')
              .append('line')
              .attr('id', 'y')
              .attr('class', 'brushing')
              .style('stroke', 'red') // colour the line
              .style('stroke-width', 1.5)
              .style('stroke-linejoin', 'round')
              .style('stroke-linecap', 'round')
              .attr('x1', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                return this.x[chart](this.newXScale[chart++].domain()[0]);
              }) // x position of the first end of the line
              .attr('y1', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                if (chart < 6) {
                  lineY = this.eixosY[chart];
                  return this.y[chart++](data[lineY].value);
                } else {
                  lineY = this.eixosX[chart];
                  return this.y[chart++](data[lineY].cprob);
                }
              }) // y position of the first end of the line
              .attr('x2', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                return this.x[chart](this.newXScale[chart++].domain()[1]);
              }) // x position of the second end of the line
              .attr('y2', () => {
                if (chart >= this.numCharts) {
                  chart = 0;
                }

                if (chart < 6) {
                  lineY = this.eixosY[chart];
                  return this.y[chart++](data[lineY].value);
                } else {
                  lineY = this.eixosX[chart];
                  return this.y[chart++](data[lineY].cprob);
                }
              }); // y position of the second end of the line
          }
        });
      });
  }

  private colorCharts() {
    d3.select('.xAxis')
      .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.select('.xAxis')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.select('.xAxis')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);

    d3.select('.yAxis')
      .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.select('.yAxis')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.select('.yAxis')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);
  }

  private drawRiskCurveLines() {
    let chart: number;
    let sortedRMs: Chart[];
    let lineX: any;

    for (chart = 6; chart < this.numCharts; chart++) {
      let cumulativeProb: number = 1;
      let previousRM: any;
      sortedRMs = this.homeService.sortRMBy(this.rms, this.eixosX[chart]);
      lineX = this.eixosX[chart];

      sortedRMs.map((rm: any, index: number) => {
        //vertical lines
        d3.select(`#chart${chart}`)
          .append('line')
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .attr('x1', () => {
            return this.x[chart](rm[lineX].value);
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.y[chart](cumulativeProb);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.x[chart](rm[lineX].value);
          }) // x position of the second end of the line
          .attr('y2', () => {
            cumulativeProb -= rm.cprobRM;
            return this.y[chart](cumulativeProb);
          }); // y position of the second end of the line

        //horizontal lines
        if (index == 0) {
          return;
        }
        previousRM = sortedRMs[index - 1];
        d3.select(`#chart${chart}`)
          .append('line')
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .attr('x1', () => {
            return this.x[chart](previousRM[lineX].value);
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.y[chart](cumulativeProb + rm.cprobRM);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.x[chart](rm[lineX].value);
          }) // x position of the second end of the line
          .attr('y2', () => {
            return this.y[chart](cumulativeProb + rm.cprobRM);
          }); // y position of the second end of the line
      });
    }
  }

  private drawBarChart() {
    const barHeight: string = '20px';
    const tempData = [
      {
        multIP: {
          original: [0.14, 0.09, 0.17, 0.15, 0.21, 0.1, 0.15],
          rmFinder: [0.0, 0.0, 0.99, 0.0, 0.01, 0.0, 0.0],
          difference: [0.14, 0.09, 0.82, 0.15, 0.2, 0.1, 0.15],
          sum: 1.64,
        },
      },
      {
        pvt: {
          original: [0.31, 0.35, 0.35],
          rmFinder: [0.01, 0.0, 0.99],
          difference: [0.3, 0.35, 0.64],
          sum: 1.29,
        },
      },
      {
        geo: {
          original: [0.37, 0.34, 0.3],
          rmFinder: [0.99, 0.0, 0.01],
          difference: [0.62, 0.34, 0.29],
          sum: 1.25,
        },
      },
    ];

    let attributes: any = [];

    tempData.map((d, i) => {
      attributes[i] = Object.keys(d)[0];
    });

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChart`)
      .selectAll('div')
      .data(tempData)
      .join('div')
      .attr('id', (d, i) => `attribute${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d, i) => attributes[i].toUpperCase());

    tempData.map((d: any, i) => {
      d3.select(`#attribute${i}`)
        .append('div')
        .selectAll('svg')
        .data(d[attributes[i]].difference)
        .join('svg')
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', 'solid medium gray')
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
    console.log('NEW WINDOW');

    let url: string;

    url = this.router.serializeUrl(
      this.router.createUrlTree([`/expandBarChart`])
    );

    let features =
      'width=1370, height=550,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    window.open(url, '_blank', features);
    return false;
  }
}
