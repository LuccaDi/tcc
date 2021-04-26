import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { Home } from '../../model/home.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private data: Home[] = [];
  private svg: any;
  private charts: any;
  private rects: any;

  private marginAll = 30;

  private height: any;

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

    this.drawPlot();
    this.addDots();
    this.colorCharts();
  }

  private drawPlot(): void {
    // const symbol = d3.symbol();

    let home: any = document.getElementById('home');

    this.width = home?.offsetWidth - this.marginAll * 2;

    this.size =
      (this.width - (this.columns + 1) * this.marginAll) / this.columns +
      this.marginAll;

    this.height = this.size * this.rows - this.marginAll * 2;

    this.svg = d3
      .select('figure#home')
      .append('svg')
      .attr('id', 'main')
      .attr('width', this.width + this.marginAll * 2)
      .attr('height', this.height + this.marginAll * 2)
      .append('g')
      .attr('transform', 'translate(' + this.marginAll + ',' + 0 + ')')
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
          return 'blue';
        }
      })
      .on('click', (d: any) => {
        let chart = 0;

        let lineX;
        let lineY;

        let dotId = d.srcElement.attributes.id.value;

        this.data.map((data: any) => {
          if (data.id == dotId) {
            this.charts.selectAll('g').selectAll('line').remove();

            this.charts
              .selectAll('g')
              .append('line')
              .attr('id', 'x')
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
}
