import { Component, OnInit } from '@angular/core';
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
  private rows = 2;
  private numCharts = 12;

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
  ];
  private eixosY = ['nkrg1', 'nkrog1', 'nkrow1', 'nkrog1', 'nkrow1', 'nkrow1'];

  private x: any = [];
  private y: any = [];

  private newXScale: any;
  private newYScale: any;

  private xAxis: any;
  private yAxis: any;

  private tempGx: any;
  private tempGy: any;

  private def: any;

  private size: any;

  constructor(private homeService: HomeService) {}

  async ngOnInit(): Promise<void> {
    this.data = await this.homeService.getData().toPromise();

    this.drawPlot();
    this.addDots();
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

    this.tempGx = this.svg.append('g').attr('class', 'x-axis');

    this.addX();

    this.tempGy = this.svg.append('g').attr('class', 'y-axis');
    this.addY();

    this.def = this.svg.append('defs');

    this.addClip();

    this.charts = this.svg.append('g').attr('class', 'charts');

    this.rects = this.svg.append('g').attr('class', 'rects');

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
          .rangeRound([this.marginAll / 2, this.size - this.marginAll / 2]);

        this.xAxis = d3
          .axisBottom(this.x[chart])
          .ticks(12)
          .tickSize(-this.size + this.marginAll);

        // selectAll('.x-axis')
        this.tempGx
          .append('g')
          .attr('class', 'x' + chart)
          .attr(
            'transform',
            'translate(' +
              col * this.size +
              ',' +
              (this.size * row - this.marginAll / 2) +
              ')'
          )
          .call(this.xAxis);
        // .call((g) => g.select('.domain').remove())
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

        console.log(extentDomain);

        this.y[chart] = d3
          .scaleLinear()
          .domain(extentDomain)
          // .domain([0, 1])
          .range([this.size - this.marginAll / 2, this.marginAll / 2]);

        this.yAxis = d3
          .axisLeft(this.y[chart])
          .ticks(12)
          .tickSize(-this.size + this.marginAll);

        // selectAll('.y-axis')
        this.tempGy
          .append('g')
          .attr('class', 'y' + chart)
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

    const newXScale = transform
      .rescaleX(this.x[id])
      .interpolate(d3.interpolateRound);
    const newYScale = transform
      .rescaleY(this.y[id])
      .interpolate(d3.interpolateRound);

    this.tempGx.select('.x' + id).call(this.xAxis.scale(newXScale));
    this.tempGy.select('.y' + id).call(this.yAxis.scale(newYScale));

    this.charts.select('.chart' + id).attr(
      'transform',

      'translate(' +
        (col * this.size + transform.x) +
        ',' +
        (row * this.size + transform.y) +
        ') scale(' +
        transform.k +
        ')'
    );

    d3.select('.chart' + id)
      .selectAll('.dot')
      .attr('d', this.symbol.size(50 / transform.k));

    this.def
      .select('#clip' + id)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginAll / 2 - transform.x)
      .attr('y', this.marginAll / 2 - transform.y);
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

    const zoom: any = d3
      .zoom()
      .scaleExtent([0.5, 5])
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
          .attr('stroke', '#aaa')
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
      .attr('class', () => 'chart' + g++)
      .attr('clip-path', () => `url(#clip${c++})`)
      .selectAll('path')
      .data(this.data)
      .join('path')
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
        if (i == 0) {
          chart++;
        }

        if (chart <= 5) {
          return (
            'translate(' +
            (this.x[chart](d[this.eixosX[chart]].value) + 0.5) +
            ',' +
            this.y[chart](d[this.eixosY[chart]].value) +
            ')'
          );
        } else {
          return (
            'translate(' +
            (this.x[chart](d[this.eixosX[chart]].value) + 0.5) +
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
      });
  }
}
