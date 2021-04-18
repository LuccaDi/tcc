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
  private rows = 1;
  private numCharts = 6;

  private eixosX = ['cRocha', 'cRocha', 'cRocha', 'nkrg1', 'nkrg1', 'nkrog1'];
  private eixosY = ['nkrg1', 'nkrog1', 'nkrow1', 'nkrog1', 'nkrow1', 'nkrow1'];

  private x: any;
  private y: any;

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
    // console.log(d3.range(this.columns));

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
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
      .attr('class', 'content');
    // .call(zoom);

    this.x = d3
      .scaleLinear()
      .domain([0, 10])
      .rangeRound([this.marginAll / 2, this.size - this.marginAll / 2]);

    this.xAxis = d3
      .axisBottom(this.x)
      .ticks(12)
      .tickSize(-this.size + this.marginAll);

    this.tempGx = this.svg.append('g').attr('class', 'x-axis');

    this.addX();

    this.y = d3
      .scaleLinear()
      .domain([0, 10])
      .range([this.size - this.marginAll / 2, this.marginAll / 2]);

    this.yAxis = d3
      .axisLeft(this.y)
      .ticks(12)
      .tickSize(-this.size + this.marginAll);

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

  private zoomed = ({ transform }: any, id: number) => {
    let row: any = document.getElementById('' + id)?.getAttribute('row');
    let col: any = document.getElementById('' + id)?.getAttribute('col');

    const newXScale = transform
      .rescaleX(this.x)
      .interpolate(d3.interpolateRound);
    const newYScale = transform
      .rescaleY(this.y)
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
    let charts = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (charts >= this.numCharts) {
          return;
        }
        this.charts
          // .selectAll('g')
          .append('g')
          .attr(
            'transform',
            'translate(' + col * this.size + ',' + row * this.size + ')'
          );

        charts++;
      }
    }
  }

  private addClip() {
    let charts = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (charts >= this.numCharts) {
          return;
        }

        this.def
          .append('clipPath')
          .attr('id', 'clip' + charts)
          .append('rect')
          .attr('x', this.marginAll / 2)
          .attr('y', this.marginAll / 2)
          .attr('width', this.size - this.marginAll)
          .attr('height', this.size - this.marginAll);

        charts++;
      }
    }
  }

  private addRect() {
    let i = 0;
    let charts = 0;

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
        if (charts >= this.numCharts) {
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

        charts++;
      }
    }
  }

  private addDots() {
    let cont = -1;
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
          cont++;
        }

        return (
          'translate(' +
          (this.x(d[this.eixosX[cont]].value) + 0.5) +
          ',' +
          this.y(d[this.eixosY[cont]].value) +
          ')'
        );
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

  private addX() {
    let charts = 0;

    for (let row = 1; row <= this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (charts >= this.numCharts) {
          return;
        }
        // selectAll('.x-axis')
        this.tempGx
          .append('g')
          .attr('class', 'x' + charts)
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

        charts++;
      }
    }
  }

  private addY() {
    let charts = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        if (charts >= this.numCharts) {
          return;
        }
        // selectAll('.y-axis')
        this.tempGy
          .append('g')
          .attr('class', 'y' + charts)
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

        charts++;
      }
    }
  }
}
