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
  public selectedSolution: number = 0;
  private data = <Solution>{};
  public solutions: Solution[] = [];
  private scatterplotAxis: string[][] = [];
  private riskCurveAxis: string[] = [];

  public combinedRiskCurvesRendered: boolean = false;

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

  private marginTop = 25;
  private marginRight = 10;
  private marginBottom = 10;
  private marginLeft = 35;

  private features: string =
    'width=900, height=650,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

  private size: number = 264;

  private height: number = this.size - this.marginTop - this.marginBottom;
  private width: number = this.size - this.marginLeft - this.marginRight;

  private symbol = d3.symbol();

  private chartColor = '#d3d3d3';
  private predefinedColor = 'green';
  private rmColor = 'orange';
  private modelColor = '#a28ad2';
  private predefinedSymbol = d3.symbolDiamond;
  private rmSymbol = d3.symbolStar;
  private modelSymbol = d3.symbolCircle;
  // private chartColor = 'red';

  constructor(private homeService: HomeService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.solutions = await this.homeService.getSolutions().toPromise();
    this.data = this.solutions[this.selectedSolution];

    this.scatterplotAxis = this.homeService.getScatterplotAxis(
      this.data.fcrossUsed
    );

    this.riskCurveAxis = this.homeService.getRiskCurveAxis(
      this.data.models[0].variables
    );

    this.rms = this.homeService.getRMs(this.data);

    this.barChartAttributes = this.data.barChart.attributes;

    this.attributesKeys = this.barChartAttributes.map(
      (attribute: any) => attribute.name
    );

    this.pen = this.data.barChart.pen;
    this.totalSum = this.data.barChart.totalSum;

    this.drawScatterplots();
    this.drawRiskCurves();
    this.drawBarChart();
    this.colorCharts();
    this.addSubtitle();
  }

  //Scatterplots
  private drawScatterplots() {
    let divs;
    let svgs;
    let svgDiv;

    // let chartWidth: any = document.getElementById(
    //   'divCrossPlotRiskCurve'
    // )?.clientWidth;

    // this.width = chartWidth;

    // this.size =
    //   (this.width - (this.columns + 1) * this.marginAll) / this.columns +
    //   this.marginAll;

    divs = d3
      .select(`#scatterplots`)
      // .append('div')
      // .style('width', '100%')
      .selectAll('div')
      // .selectAll('svg')
      .data(this.scatterplotAxis)
      .join('div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'flex-end');

    divs
      .append('a')
      .style('cursor', 'pointer')
      .append('mat-icon')
      .attr('class', 'material-icons scatterplotExpandButton')
      .text('open_in_new');

    this.updateExpandedButtonsURL();

    svgDiv = divs
      .append('div')
      .style('display', 'flex')
      .style('flex-direction', 'row');

    // Y Axis Title
    svgDiv
      .append('div')
      .style('display', 'flex')
      .style('transform', 'rotate(-90deg)')
      .style('align-self', 'center')
      .style('position', 'absolute')
      .append('p')
      .text((d) => d[1]);

    svgs = svgDiv
      .append('svg')
      // .join('svg')
      .attr('width', this.width + this.marginLeft + this.marginRight)
      .attr('height', this.height + this.marginBottom)
      .style('margin-left', '15')

      // .style('min-width', this.size)
      // .attr('viewBox', `0 0 ${this.size} ${this.size}`)
      .append('g');

    // X Axis Title
    divs
      .append('p')
      .style('align-self', 'center')
      .text((d) => d[0]);

    svgs
      .append('g')
      .attr('class', 'xAxis')
      .attr('id', (d, i) => `scatterplotXAxis${i}`);

    svgs
      .append('g')
      .attr('class', 'yAxis')
      .attr('id', (d, i) => `scatterplotYAxis${i}`);

    svgs
      .append('defs')
      .attr('class', 'clips')
      .attr('id', (d, i) => `scatterplotDef${i}`);

    svgs
      .append('g')
      .attr('class', 'rects')
      .attr('id', (d, i) => `scatterplotGRect${i}`);

    svgs
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
    let domain: any[];
    let extentDomain: any;

    this.scatterplotAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((model) => {
        return model.variables.find((variable) => variable.name == varAxis[0])
          ?.value;
      });

      extentDomain = d3.extent(domain);

      this.scatterplotsX[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.marginLeft, this.width + this.marginLeft]);

      this.xAxis = d3
        .axisBottom(this.scatterplotsX[i])
        .ticks(6, '~s')
        .tickSize(-this.height + this.marginBottom);

      this.newScatterplotXScale[i] = this.scatterplotsX[i];

      d3.select(`#scatterplotXAxis${i}`)
        .attr('transform', `translate(0, ${this.height})`)
        .call(this.xAxis);
    });
  }

  private addScatterplotY() {
    let domain: any[];
    let extentDomain: any;

    this.scatterplotAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((model) => {
        return model.variables.find((variable) => variable.name == varAxis[1])
          ?.value;
      });

      extentDomain = d3.extent(domain);

      this.scatterplotsY[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([
          this.height + this.marginTop,
          this.marginTop + this.marginBottom,
        ]);

      this.yAxis = d3
        .axisLeft(this.scatterplotsY[i])
        .ticks(6, '~s')
        .tickSize(-this.width);

      this.newScatterplotYScale[i] = this.scatterplotsY[i];

      d3.select(`#scatterplotYAxis${i}`)
        .attr('transform', `translate(${this.marginLeft}, ${-this.marginTop})`)
        .call(this.yAxis);
    });
  }

  private addScatterplotClips() {
    this.scatterplotAxis.forEach((d, i) => {
      d3.select(`#scatterplotDef${i}`)
        .append('clipPath')
        .attr('id', `scatterplotClip${i}`)
        .append('rect')
        .attr('x', this.marginLeft)
        .attr('y', this.marginTop + this.marginBottom)
        .attr('width', this.width)
        .attr('height', this.height - this.marginBottom);
    });
  }

  private addScatterplotsRects() {
    let id: number;

    const zoom: any = d3
      .zoom()
      // .scaleExtent([0.5, 5])
      // .translateExtent([
      //   [0, 0],
      //   [this.width, this.height],
      // ])
      .on('zoom', (transform) => this.scatterplotZoomed(transform, id));

    this.scatterplotAxis.forEach((d, i) => {
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
        .attr('x', this.marginLeft)
        .attr('y', this.marginBottom)
        .attr('width', this.width)
        .attr('height', this.height - this.marginBottom)
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
        .attr('clip-path', () => `url(#scatterplotClip${axisIndex})`)
        .attr('transform', 'translate(0,' + -this.marginTop + ')')
        .selectAll('path')
        .data(this.data.models)
        .join('path')
        .attr('id', (model) => model.id)
        .attr('class', 'scatterplotModel')
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return this.predefinedSymbol;
              } else if (model.rm == true) {
                return this.rmSymbol;
              } else {
                return this.modelSymbol;
              }
            })
            .size(50)
        )
        .attr('transform', (model) => {
          let valueX: any = model.variables.find(
            (variable) => variable.name == axis[0]
          )?.value;
          let valueY: any = model.variables.find(
            (variable) => variable.name == axis[1]
          )?.value;

          return `translate(
            ${this.scatterplotsX[axisIndex](valueX)}, ${this.scatterplotsY[
            axisIndex
          ](valueY)})`;
        })
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return this.predefinedColor;
          } else if (model.rm == true) {
            return this.rmColor;
          } else {
            return this.modelColor;
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

    d3.select(`#scatterplotXAxis${id}`).call(
      this.xAxis.scale(this.newScatterplotXScale[id]),
      this.xAxis.tickSize(-this.height + this.marginBottom)
    );

    d3.select(`#scatterplotYAxis${id}`).call(
      this.yAxis.scale(this.newScatterplotYScale[id]),
      this.yAxis.tickSize(-this.width)
    );

    d3.select(`#scatterplotDots${id}`).attr(
      'transform',
      `translate(${transform.x}, ${transform.y - this.marginTop}) scale(${
        transform.k
      })`
    );

    d3.select(`#scatterplotDots${id}`)
      .selectAll('.scatterplotModel')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select(`#scatterplotClip${id}`)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginLeft - transform.x)
      .attr('y', this.marginBottom + this.marginTop - transform.y);

    d3.select(`#scatterplotDots${id}`)
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.height + this.marginTop - transform.y) / transform.k) // y position of the first end of the line
      .attr(
        'y2',
        (this.marginBottom + this.marginTop - transform.y) / transform.k
      ); // y position of the second end of the line

    d3.select(`#scatterplotDots${id}`)
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.width + this.marginLeft - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.marginLeft - transform.x) / transform.k); // y position of the second end of the line

    this.colorCharts();
  };

  //Risk Curves
  private drawRiskCurves() {
    let divs;
    let svgs;
    let svgDiv;

    divs = d3
      .select(`#riskCurves`)
      // .append('div')
      .selectAll('div')
      // .selectAll('svg')
      .data(this.riskCurveAxis)
      .join('div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'flex-end');
    // .join('svg')

    divs
      .append('a')
      .style('cursor', 'pointer')
      .append('mat-icon')
      .attr('class', 'material-icons riskCurveExpandButton')
      .text('open_in_new');

    this.updateExpandedButtonsURL();

    svgDiv = divs
      .append('div')
      .style('display', 'flex')
      .style('flex-direction', 'row');

    // Y Axis Title
    svgDiv
      .append('div')
      .style('display', 'flex')
      .style('transform', 'rotate(-90deg)')
      .style('align-self', 'center')
      .style('position', 'absolute')
      .append('p')
      .text('C. Prob');

    svgs = svgDiv
      .append('svg')
      .attr('width', this.width + this.marginLeft + this.marginRight)
      .attr('height', this.height + this.marginBottom)
      .style('margin-left', '15')
      .append('g');

    // X Axis Title
    divs
      .append('p')
      .style('align-self', 'center')
      .text((d) => d);

    svgs
      .append('g')
      .attr('class', 'xAxis')
      .attr('id', (d, i) => `riskCurveXAxis${i}`);

    svgs
      .append('g')
      .attr('class', 'yAxis')
      .attr('id', (d, i) => `riskCurveYAxis${i}`);

    svgs
      .append('defs')
      .attr('class', 'clips')
      .attr('id', (d, i) => `riskCurveDef${i}`);

    svgs
      .append('g')
      .attr('class', 'rects')
      .attr('id', (d, i) => `riskCurveGRect${i}`);

    svgs
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
    let domain: any[];
    let extentDomain: any;

    this.riskCurveAxis.forEach((varAxis, i) => {
      domain = this.data.models.map((model) => {
        return model.variables.find((variable) => variable.name == varAxis)
          ?.value;
      });

      extentDomain = d3.extent(domain);

      this.riskCurvesX[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([this.marginLeft, this.width + this.marginLeft]);

      this.xAxis = d3
        .axisBottom(this.riskCurvesX[i])
        .ticks(6, '~s')
        .tickSize(-this.height + this.marginBottom);

      this.newRiskCurveXScale[i] = this.riskCurvesX[i];

      d3.select(`#riskCurveXAxis${i}`)
        .attr('transform', `translate(0, ${this.height})`)
        .call(this.xAxis);
    });
  }

  private addRiskCurveY() {
    let extentDomain: number[];

    this.riskCurveAxis.forEach((varAxis, i) => {
      extentDomain = [0, 1];

      this.riskCurvesY[i] = d3
        .scaleLinear()
        .domain(extentDomain)
        .range([
          this.height + this.marginTop,
          this.marginTop + this.marginBottom,
        ]);

      this.yAxis = d3
        .axisLeft(this.riskCurvesY[i])
        .ticks(6, '~s')
        .tickSize(-this.width);

      this.newRiskCurveYScale[i] = this.riskCurvesY[i];

      d3.select(`#riskCurveYAxis${i}`)
        .attr('transform', `translate(${this.marginLeft}, ${-this.marginTop})`)
        .call(this.yAxis);
    });
  }

  private addRiskCurveClips() {
    this.riskCurveAxis.forEach((d, i) => {
      d3.select(`#riskCurveDef${i}`)
        .append('clipPath')
        .attr('id', `riskCurveClip${i}`)
        .append('rect')
        .attr('x', this.marginLeft)
        .attr('y', this.marginTop + this.marginBottom)
        .attr('width', this.width)
        .attr('height', this.height - this.marginBottom);
    });
  }

  private addRiskCurvesRects() {
    let id: number;

    const zoom: any = d3
      .zoom()
      // .scaleExtent([0.5, 5])
      // .translateExtent([
      //   [0, 0],
      //   [this.width, this.height],
      // ])
      .on('zoom', (transform) => this.riskCurveZoomed(transform, id));

    this.riskCurveAxis.forEach((d, i) => {
      d3.select(`#riskCurveGRect${i}`)
        .append('rect')
        .attr('fill', '#FFFFFF')
        .attr('fill-opacity', '0.0')
        .attr('x', this.marginLeft)
        .attr('y', this.marginBottom)
        .attr('width', this.width)
        .attr('height', this.height - this.marginBottom)
        .attr('id', () => `#riskCurveRect${i}`)
        .on('mouseover', function () {
          id = i;
        })
        .call(zoom);
    });
  }

  private addRiskCurvesDots() {
    this.riskCurveAxis.forEach((axis, axisIndex) => {
      d3.select(`#riskCurveDots${axisIndex}`)
        .attr('clip-path', () => `url(#riskCurveClip${axisIndex})`)
        .attr('transform', 'translate(0,' + -this.marginTop + ')')
        .selectAll('path')
        .data(this.data.models)
        .join('path')
        .attr('id', (model) => model.id)
        .attr('class', 'riskCurveModel')
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return this.predefinedSymbol;
              } else if (model.rm == true) {
                return this.rmSymbol;
              } else {
                return this.modelSymbol;
              }
            })
            .size(50)
        )
        .attr('transform', (model) => {
          let valueX: any = model.variables.find(
            (variable) => variable.name == axis
          )?.value;
          let valueY: any = model.variables.find(
            (variable) => variable.name == axis
          )?.cprob;

          return `translate(
            ${this.riskCurvesX[axisIndex](valueX)}, ${this.riskCurvesY[
            axisIndex
          ](valueY)})`;
        })
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return this.predefinedColor;
          } else if (model.rm == true) {
            return this.rmColor;
          } else {
            return this.modelColor;
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
          .attr('id', `verticalRiskCurveLines${rmIndex}`)
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .transition()
          .duration(1000)
          .attr('x1', () => {
            return this.riskCurvesX[axisIndex](
              rm.variables.find((variable: any) => variable.name == axis)?.value
            );
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.riskCurvesY[axisIndex](cumulativeProb);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.riskCurvesX[axisIndex](
              rm.variables.find((variable: any) => variable.name == axis)?.value
            );
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
          .attr('id', `horizontalRiskCurveLines${rmIndex}`)
          .attr('class', 'riskCurveLines')
          .style('stroke', 'black') // colour the line
          .style('stroke-linejoin', 'round')
          .style('stroke-linecap', 'round')
          .transition()
          .duration(1000)
          .attr('x1', () => {
            return this.riskCurvesX[axisIndex](
              previousRM.variables.find(
                (variable: any) => variable.name == axis
              )?.value
            );
          }) // x position of the first end of the line
          .attr('y1', () => {
            return this.riskCurvesY[axisIndex](cumulativeProb + rm.cprobRM);
          }) // y position of the first end of the line
          .attr('x2', () => {
            return this.riskCurvesX[axisIndex](
              rm.variables.find((variable: any) => variable.name == axis)?.value
            );
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

    d3.select(`#riskCurveXAxis${id}`).call(
      this.xAxis.scale(this.newRiskCurveXScale[id]),
      this.xAxis.tickSize(-this.height + this.marginBottom)
    );

    d3.select(`#riskCurveYAxis${id}`).call(
      this.yAxis.scale(this.newRiskCurveYScale[id]),
      this.yAxis.tickSize(-this.width)
    );

    d3.select(`#riskCurveDots${id}`).attr(
      'transform',
      `translate(${transform.x}, ${transform.y - this.marginTop}) scale(${
        transform.k
      })`
    );

    d3.select(`#riskCurveDots${id}`)
      .selectAll('.riskCurveModel')
      .attr('d', this.symbol.size(50 / transform.k));
    // .attr('d', d3.symbol().size(50 / transform.k));

    d3.select(`#riskCurveClip${id}`)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginLeft - transform.x)
      .attr('y', this.marginBottom + this.marginTop - transform.y);

    d3.select(`#riskCurveDots${id}`)
      .select('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.height + this.marginTop - transform.y) / transform.k) // y position of the first end of the line
      .attr(
        'y2',
        (this.marginBottom + this.marginTop - transform.y) / transform.k
      ); // y position of the second end of the line

    d3.select(`#riskCurveDots${id}`)
      .select('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.width + this.marginLeft - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.marginLeft - transform.x) / transform.k); // y position of the second end of the line

    //Resize risk curve lines
    d3.select(`#riskCurveDots${id}`)
      .selectAll('.riskCurveLines')
      .style('stroke-width', 1.5 / transform.k);

    this.colorCharts();
  };

  //Bar Chart
  private drawBarChart() {
    const barHeight: string = '20px';

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChart`)
      .selectAll('div')
      .data(this.barChartAttributes)
      .join('div')
      .attr('id', (d, i) => `attribute${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d: any) => d.name.toUpperCase());

    this.barChartAttributes.map((attribute: any, index: number) => {
      d3.select(`#attribute${index}`)
        .append('div')
        .selectAll('svg')
        .data(attribute.difference)
        .join('svg')
        .attr('id', (d, i) => attribute.name + i)
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', 'solid medium grey')
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('class', 'barChart')
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
              this.scatterplotsX[axisIndex](
                model.variables.find(
                  (variable: any) => variable.name == axis[0]
                )?.value
              )
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.scatterplotsY[axisIndex](
                this.newScatterplotYScale[axisIndex].domain()[0]
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.scatterplotsX[axisIndex](
                model.variables.find(
                  (variable: any) => variable.name == axis[0]
                )?.value
              )
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
              this.scatterplotsY[axisIndex](
                model.variables.find(
                  (variable: any) => variable.name == axis[1]
                )?.value
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.scatterplotsX[axisIndex](
                this.newScatterplotXScale[axisIndex].domain()[1]
              )
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.scatterplotsY[axisIndex](
                model.variables.find(
                  (variable: any) => variable.name == axis[1]
                )?.value
              )
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
              this.riskCurvesX[axisIndex](
                model.variables.find((variable: any) => variable.name == axis)
                  ?.value
              )
            ) // x position of the first end of the line
            .attr('y1', () =>
              this.riskCurvesY[axisIndex](
                this.newRiskCurveYScale[axisIndex].domain()[0]
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.riskCurvesX[axisIndex](
                model.variables.find((variable: any) => variable.name == axis)
                  ?.value
              )
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
              this.riskCurvesY[axisIndex](
                model.variables.find((variable: any) => variable.name == axis)
                  ?.cprob
              )
            ) // y position of the first end of the line
            .attr('x2', () =>
              this.riskCurvesX[axisIndex](
                this.newRiskCurveXScale[axisIndex].domain()[1]
              )
            ) // x position of the second end of the line
            .attr('y2', () =>
              this.riskCurvesY[axisIndex](
                model.variables.find((variable: any) => variable.name == axis)
                  ?.cprob
              )
            ); // y position of the second end of the line
        });

        //bar chart brushing
        this.attributesKeys.map((key) => {
          d3.select(
            `#${
              key +
              model.attributes.find((attribute: any) => attribute.name == key)
                .value
            }`
          )
            .style('background-color', 'lightblue')
            .style('border', 'solid medium green');
        });
      }
    });
  }

  private colorCharts() {
    d3.selectAll('.xAxis').select('.domain').attr('stroke', this.chartColor);
    d3.selectAll('.xAxis')
      .selectAll('g')
      .select('.tick line')
      .attr('stroke', this.chartColor);
    d3.selectAll('.xAxis')
      .selectAll('g')
      .select('.tick text')
      .attr('fill', this.chartColor);
    // d3.select('.xAxis').selectAll('text').attr('fill', this.chartColor);

    d3.selectAll('.yAxis').select('.domain').attr('stroke', this.chartColor);
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

  public previousSolution() {
    if (this.selectedSolution > 0) {
      --this.selectedSolution;
      this.updateSolutionData();
      this.updateExpandedButtonsURL();
    }
  }

  public nextSolution() {
    if (this.selectedSolution < this.solutions.length - 1) {
      ++this.selectedSolution;
      this.updateSolutionData();
      this.updateExpandedButtonsURL();
    }
  }

  public renderCombinedRiskCurves(tabIndex: number) {
    if (tabIndex == 1) {
      this.combinedRiskCurvesRendered = true;
    }
  }

  public updateSolutionData() {
    this.data = this.solutions[this.selectedSolution];
    this.rms = this.homeService.getRMs(this.data);
    this.barChartAttributes = this.data.barChart.attributes;
    this.attributesKeys = Object.keys(this.barChartAttributes);
    this.pen = this.data.barChart.pen;
    this.totalSum = this.data.barChart.totalSum;

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    // Make the changes
    this.clearSelection();

    //scatterplot changes
    this.scatterplotAxis.forEach((axis, axisIndex) => {
      d3.select(`#scatterplotDots${axisIndex}`)
        .selectAll('.scatterplotModel')
        .data(this.data.models)
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return this.predefinedSymbol;
              } else if (model.rm == true) {
                return this.rmSymbol;
              } else {
                return this.modelSymbol;
              }
            })
            .size(50)
        )
        .transition()
        .duration(1000)
        .attr('transform', (model) => {
          let valueX: any = model.variables.find(
            (variable) => variable.name == axis[0]
          )?.value;
          let valueY: any = model.variables.find(
            (variable) => variable.name == axis[1]
          )?.value;

          return `translate(
            ${this.scatterplotsX[axisIndex](valueX)}, ${this.scatterplotsY[
            axisIndex
          ](valueY)})`;
        })
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return this.predefinedColor;
          } else if (model.rm == true) {
            return this.rmColor;
          } else {
            return this.modelColor;
          }
        });
    });

    //risk curve changes
    this.riskCurveAxis.forEach((axis, axisIndex) => {
      d3.select(`#riskCurveDots${axisIndex}`)
        .selectAll('.riskCurveModel')
        .data(this.data.models)
        .attr(
          'd',
          this.symbol
            .type((model) => {
              if (model.predefined == true) {
                return this.predefinedSymbol;
              } else if (model.rm == true) {
                return this.rmSymbol;
              } else {
                return this.modelSymbol;
              }
            })
            .size(50)
        )
        .transition()
        .duration(1000)
        .attr('transform', (model) => {
          let valueX: any = model.variables.find(
            (variable) => variable.name == axis
          )?.value;
          let valueY: any = model.variables.find(
            (variable) => variable.name == axis
          )?.cprob;

          return `translate(
            ${this.riskCurvesX[axisIndex](valueX)}, ${this.riskCurvesY[
            axisIndex
          ](valueY)})`;
        })
        .attr('fill', (model) => {
          if (model.predefined == true) {
            return this.predefinedColor;
          } else if (model.rm == true) {
            return this.rmColor;
          } else {
            return this.modelColor;
          }
        });
    });

    //risk curve lines changes
    d3.selectAll('.riskCurveLines').remove();
    this.drawRiskCurveLines();

    //bar chart changes
    this.barChartAttributes.map((attribute: any, index: number) => {
      d3.select(`#attribute${index}`)
        // .append('div')
        // .selectAll('svg')
        .selectAll(`.barChart`)
        .data(attribute.difference)
        .transition()
        .duration(1000)
        .attr('width', (d: any) => x(d) - x(0));
    });
  }

  private updateExpandedButtonsURL() {
    //scatterplots
    d3.selectAll(`.scatterplotExpandButton`)
      .data(this.scatterplotAxis)
      .attr(
        'onclick',
        (d, i) =>
          `window.open('${this.router.serializeUrl(
            this.router.createUrlTree([
              `/expandChart`,
              `scatterplot`,
              `${this.selectedSolution}`,
              `${i}`,
            ])
          )}', '_blank', '${this.features}'); return false;`
      );

    //risk curves
    d3.selectAll(`.riskCurveExpandButton`)
      .data(this.riskCurveAxis)
      .attr(
        'onclick',
        (d, i) =>
          `window.open('${this.router.serializeUrl(
            this.router.createUrlTree([
              `/expandChart`,
              `riskCurve`,
              `${this.selectedSolution}`,
              `${i}`,
            ])
          )}', '_blank', '${this.features}'); return false;`
      );
  }

  private addSubtitle() {
    let subtitle = d3.select('#subtitle');

    let symbol = d3.symbol();

    let subtitles = ['Predefined RM', 'RM', 'Other Models'];
    let symbols = [this.predefinedSymbol, this.rmSymbol, this.modelSymbol];
    let colors = [this.predefinedColor, this.rmColor, this.modelColor];

    subtitle
      .selectAll('path')
      .data(symbols)
      .join('path')
      .attr('d', symbol.type((d) => d).size(100))
      .attr('fill', (d, i) => colors[i])
      .attr('transform', (d, i) => `translate(${40}, ${(i + 1) * 20})`);

    subtitle
      .selectAll('text')
      .data(subtitles)
      .join('text')
      .text((d) => d)
      .style('fill', (d, i) => colors[i])
      .attr('transform', (d, i) => `translate(${50}, ${(i + 1) * 20})`)
      .style('alignment-baseline', 'middle');
  }
}
