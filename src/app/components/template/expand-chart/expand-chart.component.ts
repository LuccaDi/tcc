import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import * as d3 from 'd3';
import { Solution } from '../../model/solution.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-expand-chart',
  templateUrl: './expand-chart.component.html',
  styleUrls: ['./expand-chart.component.css'],
})
export class ExpandChartComponent implements OnInit {
  // private data: Chart[] = [];
  // private rms: Chart[] = [];
  private scatterplotAxis: string[][] = [];
  private riskCurveAxis: string[] = [];
  private rms: any;
  private data = <Solution>{};
  private solutions: Solution[] = [];

  // private data: Solution[] = [];
  // private rms: newChart[] = [];

  private id: any;
  private chartType: string = '';
  private selectedSolution: any;

  private marginAll = 30;

  private height: any;

  private width: any;

  private symbol = d3.symbol();

  private x: any;
  private y: any;

  private newXScale: any;
  private newYScale: any;

  private xAxis: any;
  private yAxis: any;

  private chartColor = '#d3d3d3';
  private predefinedColor = 'green';
  private rmColor = 'orange';
  private modelColor = '#a28ad2';
  private predefinedSymbol = d3.symbolDiamond;
  private rmSymbol = d3.symbolStar;
  private modelSymbol = d3.symbolCircle;

  expandedChartWidth = 0;
  expandedChartHeight = 0;

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.onResize();
    this.id = this.route.snapshot.params.id;
    this.chartType = this.route.snapshot.params.chart;
    this.selectedSolution = this.route.snapshot.params.solution;

    console.log(this.selectedSolution);

    this.solutions = await this.homeService.getSolutions().toPromise();
    this.data = this.solutions[this.selectedSolution];

    this.scatterplotAxis = this.homeService.getScatterplotAxis(
      this.data.fcrossUsed
    );
    this.riskCurveAxis = this.homeService.getRiskCurveAxis(
      this.data.models[0].variables
    );

    // this.data = await this.homeService.getData().toPromise();
    // this.rms = await this.homeService.getRMs();

    this.rms = this.homeService.getRMs(this.data);

    this.drawPlot();
    this.addDots();
    this.colorChart();
    if (this.chartType == 'riskCurve') {
      this.drawRiskCurveLines();
    }
  }

  onResize() {
    let chartWidth: any = document.getElementById('gridList')?.clientWidth;

    if (chartWidth <= 560) {
      this.expandedChartWidth = 1;
      d3.select('#dotsInfo').style('flex-direction', 'column');
    } else {
      this.expandedChartWidth = 2;
      d3.select('#dotsInfo').style('flex-direction', 'row');
    }
  }

  private drawPlot(): void {
    this.height = document.getElementById('tileChart')?.clientHeight;
    this.width = document.getElementById('tileChart')?.clientWidth;

    d3.select('#svgExpandedChart').attr(
      'viewBox',
      `0 0 ${this.width} ${this.height}`
    );

    this.addX();

    this.addY();

    this.addClip();

    this.addRect();
  }

  private addX() {
    let domain;
    let extentDomain: any;

    if (this.chartType == 'scatterplot') {
      domain = this.data.models.map((d: any) => {
        return d.variables[this.scatterplotAxis[this.id][0]].value;
      });
    } else {
      domain = this.data.models.map((d: any) => {
        return d.variables[this.riskCurveAxis[this.id]].value;
      });
    }

    extentDomain = d3.extent(domain);

    this.x = d3
      .scaleLinear()
      .domain(extentDomain)
      .range([this.marginAll / 2, this.width - this.marginAll / 2 - 1]);

    this.xAxis = d3
      .axisBottom(this.x)
      .ticks(6, '~s')
      .tickSize(this.height - this.marginAll);

    this.newXScale = this.x;

    d3.select('g')
      .append('g')
      .attr('id', 'x')
      .attr('class', 'axis')
      .attr(
        'transform',
        'translate(' + this.marginAll / 2 + ',' + this.marginAll / 2 + ')'
      )
      .call(this.xAxis);
  }

  private addY() {
    let domain;
    let extentDomain: any;

    if (this.chartType == 'scatterplot') {
      domain = this.data.models.map((d: any) => {
        return d.variables[this.scatterplotAxis[this.id][1]].value;
      });
      extentDomain = d3.extent(domain);
    } else {
      extentDomain = [0, 1];
    }

    this.y = d3
      .scaleLinear()
      .domain(extentDomain)
      .range([this.height - this.marginAll / 2, this.marginAll / 2]);

    this.yAxis = d3
      .axisLeft(this.y)
      .ticks(6)
      .tickSize(this.width - this.marginAll);

    this.newYScale = this.y;

    d3.select('g')
      .append('g')
      .attr('id', 'y')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + this.width + ',' + 0 + ')')
      .call(this.yAxis);
  }

  private addClip() {
    d3.select('g')
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', this.marginAll / 2)
      .attr('y', this.marginAll / 2)
      .attr('width', this.width - this.marginAll / 2)
      .attr('height', this.height - this.marginAll);
  }

  private addRect() {
    const zoom: any = d3
      .zoom()
      .on('zoom', (transform) => this.zoomed(transform));

    d3.select('g')
      .append('rect')
      .attr(
        'transform',
        'translate(' + this.marginAll + ',' + this.marginAll / 2 + ')'
      )
      .attr('fill', '#FFFFFF')
      .attr('fill-opacity', '0.0')
      .attr('width', this.width - this.marginAll)
      .attr('height', this.height - this.marginAll)
      .call(zoom);
  }

  private addDots() {
    d3.select('g')
      .append('g')
      .attr('transform', 'translate(' + this.marginAll / 2 + ',' + 0 + ')')
      .attr('id', () => 'chart')
      .attr('clip-path', () => `url(#clip)`)
      .selectAll('path')
      .data(this.data.models)
      .join('path')
      .attr('id', (d: any) => d.id)
      .attr('class', 'dot')
      .attr(
        'd',
        this.symbol
          .type((d: any) => {
            if (d.predefined == true) {
              return this.predefinedSymbol;
            } else if (d.rm == true) {
              return this.rmSymbol;
            } else {
              return this.modelSymbol;
            }
          })
          .size(50)
      )
      .attr('transform', (d: any) => {
        if (this.chartType == 'scatterplot') {
          return (
            'translate(' +
            this.x(d.variables[this.scatterplotAxis[this.id][0]].value) +
            ',' +
            this.y(d.variables[this.scatterplotAxis[this.id][1]].value) +
            ')'
          );
        } else {
          return (
            'translate(' +
            this.x(d.variables[this.riskCurveAxis[this.id]].value) +
            ',' +
            this.y(d.variables[this.riskCurveAxis[this.id]].cprob) +
            ')'
          );
        }
      })
      .attr('fill', (d: any) => {
        if (d.predefined == true) {
          return this.predefinedColor;
        } else if (d.rm == true) {
          return this.rmColor;
        } else {
          return this.modelColor;
        }
      })
      .on('click', (d: any) => {
        let dotId = d.srcElement.attributes.id.value;

        this.data.models.map((data: any) => {
          if (data.id == dotId) {
            d3.select('#chart').selectAll('.brushing').remove();

            d3.select('#chart')
              .append('line')
              .attr('id', 'x')
              .attr('class', 'brushing')
              .style('stroke', 'red') // colour the line
              .style('stroke-width', 1.5)
              .style('stroke-linejoin', 'round')
              .style('stroke-linecap', 'round')
              .attr('x1', () => {
                if (this.chartType == 'scatterplot') {
                  return this.x(
                    data.variables[this.scatterplotAxis[this.id][0]].value
                  );
                } else {
                  return this.x(
                    data.variables[this.riskCurveAxis[this.id]].value
                  );
                }
              }) // x position of the first end of the line
              .attr('y1', () => {
                return this.y(this.newYScale.domain()[0]);
              }) // y position of the first end of the line
              .attr('x2', () => {
                if (this.chartType == 'scatterplot') {
                  return this.x(
                    data.variables[this.scatterplotAxis[this.id][0]].value
                  );
                } else {
                  return this.x(
                    data.variables[this.riskCurveAxis[this.id]].value
                  );
                }
              }) // x position of the second end of the line
              .attr('y2', () => {
                return this.y(this.newYScale.domain()[1]);
              }); // y position of the second end of the line

            d3.select('#chart')
              .append('line')
              .attr('id', 'y')
              .attr('class', 'brushing')
              .style('stroke', 'red') // colour the line
              .style('stroke-width', 1.5)
              .style('stroke-linejoin', 'round')
              .style('stroke-linecap', 'round')
              .attr('x1', () => {
                return this.x(this.newXScale.domain()[0]);
              }) // x position of the first end of the line
              .attr('y1', () => {
                if (this.chartType == 'scatterplot') {
                  return this.y(
                    data.variables[this.scatterplotAxis[this.id][1]].value
                  );
                } else {
                  return this.y(
                    data.variables[this.riskCurveAxis[this.id]].cprob
                  );
                }
              }) // y position of the first end of the line
              .attr('x2', () => {
                return this.x(this.newXScale.domain()[1]);
              }) // x position of the second end of the line
              .attr('y2', () => {
                if (this.chartType == 'scatterplot') {
                  return this.y(
                    data.variables[this.scatterplotAxis[this.id][1]].value
                  );
                } else {
                  return this.y(
                    data.variables[this.riskCurveAxis[this.id]].cprob
                  );
                }
              }); // y position of the second end of the line

            this.displayInfo(data);
          }
        });
      });
  }

  private zoomed = ({ transform }: any) => {
    this.newXScale = transform
      .rescaleX(this.x)
      .interpolate(d3.interpolateRound);
    this.newYScale = transform
      .rescaleY(this.y)
      .interpolate(d3.interpolateRound);

    d3.select('#x').call(this.xAxis.scale(this.newXScale));

    d3.select('#y').call(this.yAxis.scale(this.newYScale));

    d3.select('#chart').attr(
      'transform',
      'translate(' +
        (this.marginAll / 2 + transform.x) +
        ',' +
        transform.y +
        ') scale(' +
        transform.k +
        ')'
    );

    d3.select('#chart')
      .selectAll('.dot')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select('#clip')
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginAll / 2 - transform.x)
      .attr('y', this.marginAll / 2 - transform.y);

    d3.select('#chart')
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr(
        'y1',
        (this.height - this.marginAll / 2 - transform.y) / transform.k
      ) // y position of the first end of the line
      .attr('y2', (this.marginAll / 2 - transform.y) / transform.k); // y position of the second end of the line

    d3.select('#chart')
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.marginAll / 2 - transform.x) / transform.k) // y position of the first end of the line
      .attr(
        'x2',
        (this.width - this.marginAll / 2 - transform.x) / transform.k
      ); // y position of the second end of the line

    //Resize risk curve lines
    d3.select('#chart')
      .selectAll('.riskCurveLines')
      .style('stroke-width', 1.5 / transform.k);

    this.colorChart();
  };

  private displayInfo(data: any) {
    let info;
    let info2;

    let entries = Object.entries(data).filter((d) => {
      return (
        typeof d[1] != 'object' &&
        d[0] != 'predefined' &&
        d[0] != 'rm' &&
        d[1] != null
      );
    });

    Object.entries(data.attributes).forEach((d) => {
      entries.push(d);
    });

    Object.entries(data.variables).forEach((d) => {
      entries.push(d);
    });

    info = entries.filter((d, i) => {
      return i < Math.round(entries.length / 2);
    });

    info2 = entries.filter((d, i) => {
      return i >= Math.round(entries.length / 2);
    });

    console.log(info);
    console.log(info2);

    d3.select('#dotsInfo').selectAll('div').remove();

    d3.select('#dotsInfo')
      .append('div')
      .style('margin-left', '5px')
      .style('margin-right', '5px')
      .selectAll('p')
      .data(info)
      .join('p')
      .text((d: any) => {
        return typeof d[1] == 'object'
          ? `${d[0]} =  ${d[1].value}, C.Prob = ${d[1].cprob}`
          : `${d[0]} =  ${d[1]}`;
      });

    d3.select('#dotsInfo')
      .append('div')
      .style('margin-left', '5px')
      .selectAll('p')
      .data(info2)
      .join('p')
      .text((d: any) => {
        return typeof d[1] == 'object'
          ? `${d[0]} =  ${d[1].value}, C.Prob = ${d[1].cprob}`
          : `${d[0]} =  ${d[1]}`;
      });
  }

  private colorChart() {
    d3.select('#x')
      // .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.select('#x')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.select('#x')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);

    d3.select('#y')
      // .selectAll('g')
      .select('.domain')
      .attr('stroke', this.chartColor);
    d3.select('#y')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.select('#y')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);
  }

  private drawRiskCurveLines() {
    // let sortedRMs: Chart[];
    let sortedRMs: Object[];
    let lineX: any;

    let cumulativeProb: number = 1;
    let previousRM: any;
    sortedRMs = this.homeService.sortRMBy(
      this.rms,
      this.riskCurveAxis[this.id]
    );
    lineX = this.riskCurveAxis[this.id];

    sortedRMs.map((rm: any, index: number) => {
      //vertical lines
      d3.select(`#chart`)
        .append('line')
        .attr('class', 'riskCurveLines')
        .style('stroke', 'black') // colour the line
        .style('stroke-linejoin', 'round')
        .style('stroke-linecap', 'round')
        .attr('x1', () => {
          return this.x(rm.variables[lineX].value);
        }) // x position of the first end of the line
        .attr('y1', () => {
          return this.y(cumulativeProb);
        }) // y position of the first end of the line
        .attr('x2', () => {
          return this.x(rm.variables[lineX].value);
        }) // x position of the second end of the line
        .attr('y2', () => {
          cumulativeProb -= rm.cprobRM;
          return this.y(cumulativeProb);
        }); // y position of the second end of the line

      //horizontal lines
      if (index == 0) {
        return;
      }
      previousRM = sortedRMs[index - 1];
      d3.select(`#chart`)
        .append('line')
        .attr('class', 'riskCurveLines')
        .style('stroke', 'black') // colour the line
        .style('stroke-linejoin', 'round')
        .style('stroke-linecap', 'round')
        .attr('x1', () => {
          return this.x(previousRM.variables[lineX].value);
        }) // x position of the first end of the line
        .attr('y1', () => {
          return this.y(cumulativeProb + rm.cprobRM);
        }) // y position of the first end of the line
        .attr('x2', () => {
          return this.x(rm.variables[lineX].value);
        }) // x position of the second end of the line
        .attr('y2', () => {
          return this.y(cumulativeProb + rm.cprobRM);
        }); // y position of the second end of the line
    });
  }
}
