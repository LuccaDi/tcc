import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { ScaleLinear } from 'd3';
import { Solution } from '../../model/solution.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-combined-risk-curves',
  templateUrl: './combined-risk-curves.component.html',
  styleUrls: ['./combined-risk-curves.component.css'],
})
export class CombinedRiskCurvesComponent implements OnInit {
  public solutions: Solution[] = [];
  private solutionsModels: Object[] = [];
  private riskCurveAxis: string[] = [];

  private riskCurvesX: ScaleLinear<number, number, never>[] = [];
  private newRiskCurveXScale: ScaleLinear<number, number, never>[] = [];
  private xAxis: any;

  private riskCurvesY: ScaleLinear<number, number, never>[] = [];
  private newRiskCurveYScale: ScaleLinear<number, number, never>[] = [];
  private yAxis: any;

  private rms: Object[] = [];

  private marginTop = 25;
  private marginRight = 10;
  private marginBottom = 10;
  private marginLeft = 35;

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

  constructor(private homeService: HomeService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.solutions = await this.homeService.getSolutions().toPromise();
    this.riskCurveAxis = this.homeService.getRiskCurveAxis(
      this.solutions[0].models[0].variables
    );

    this.getAllSolutionsRMs();

    this.drawRiskCurves();
    this.colorCharts();
  }

  private getAllSolutionsRMs() {
    let tempRMs: Object[] = [];

    this.solutions.forEach((solution) => {
      tempRMs = this.homeService.getRMs(solution);

      this.rms = this.rms.concat(tempRMs);
    });
  }

  private drawRiskCurves() {
    let divs;
    let svgs;
    let svgDiv;
    // let features: string =
    //   'width=900, height=650,menubar=yes,location=no,resizable=no,scrollbars=no,status=no';

    // console.log(d3.select(`#combinedRiskCurves`));

    d3.select(`#combinedRiskCurves`)
      .selectAll('div')
      .data(this.riskCurveAxis)
      .join('div')
      .attr('class', 'teste')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'flex-end');

    divs = d3
      .select(`#combinedRiskCurves`)
      .selectAll('div')
      .data(this.riskCurveAxis)
      .join('div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('align-items', 'flex-end');

    // divs
    //   .append('a')
    //   .style('cursor', 'pointer')
    //   .append('mat-icon')
    //   .attr('class', 'material-icons')
    //   .text('open_in_new')
    //   .attr(
    //     'onclick',
    //     (d, i) =>
    //       `window.open('${this.router.serializeUrl(
    //         this.router.createUrlTree([`/expandChart`, `riskCurve`, `${i}`])
    //       )}', '_blank', '${features}'); return false;`
    //   );

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
      // .style('margin-bottom', '55px')
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
    let domain: number[];
    let extentDomain: any;

    this.riskCurveAxis.forEach((varAxis, i) => {
      this.solutions.forEach((solution) => {
        domain = solution.models.map((d) => {
          return d.variables[varAxis].value;
        });

        domain = domain.concat(domain);
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
    let tempSolutionModels;

    this.solutions.forEach((solution) => {
      tempSolutionModels = solution.models;

      this.solutionsModels = this.solutionsModels.concat(tempSolutionModels);
    });

    this.riskCurveAxis.forEach((axis, axisIndex) => {
      d3.select(`#riskCurveDots${axisIndex}`)
        .attr('clip-path', () => `url(#riskCurveClip${axisIndex})`)
        .attr('transform', 'translate(0,' + -this.marginTop + ')')
        .selectAll('path')
        .data(this.solutionsModels)
        .join('path')
        .attr('id', (model: any) => model.id)
        .attr('class', 'model')
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
        .attr(
          'transform',
          (model: any) =>
            `translate(${this.riskCurvesX[axisIndex](
              model.variables[axis].value
            )}, ${this.riskCurvesY[axisIndex](model.variables[axis].cprob)})`
        )
        .attr('fill', (model: any) => {
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

    d3.select(`#riskCurveXAxis${id}`).call(
      this.xAxis.scale(this.newRiskCurveXScale[id]),
      this.xAxis.tickSize(-this.height + this.marginBottom)
    );

    d3.select(`#riskCurveYAxis${id}`).call(
      this.yAxis.scale(this.newRiskCurveYScale[id]),
      this.yAxis.tickSize(-this.width)
    );

    d3.select(`#riskCurveDots${id}`)
      .selectAll('.model')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select(`#riskCurveDots${id}`).attr(
      'transform',
      `translate(${transform.x}, ${transform.y - this.marginTop}) scale(${
        transform.k
      })`
    );

    d3.select(`#riskCurveDots${id}`)
      .selectAll('.model')
      .attr('d', this.symbol.size(50 / transform.k));

    d3.select(`#riskCurveClip${id}`)
      .select('rect')
      .attr('transform', 'scale(' + 1 / transform.k + ')')
      .attr('x', this.marginLeft - transform.x)
      .attr('y', this.marginBottom + this.marginTop - transform.y);

    d3.select(`#riskCurveDots${id}`)
      .selectAll('#x')
      .style('stroke-width', 1.5 / transform.k)
      .attr('y1', (this.height + this.marginTop - transform.y) / transform.k) // y position of the first end of the line
      .attr(
        'y2',
        (this.marginBottom + this.marginTop - transform.y) / transform.k
      ); // y position of the second end of the line

    d3.select(`#riskCurveDots${id}`)
      .selectAll('#y')
      .style('stroke-width', 1.5 / transform.k)
      .attr('x1', (this.width + this.marginLeft - transform.x) / transform.k) // y position of the first end of the line
      .attr('x2', (this.marginLeft - transform.x) / transform.k); // y position of the second end of the line

    //Resize risk curve lines
    d3.select(`#riskCurveDots${id}`)
      .selectAll('.riskCurveLines')
      .style('stroke-width', 1.5 / transform.k);

    this.colorCharts();
  };

  private brushing(modelClicked: any) {
    this.clearSelection();

    let modelId = modelClicked.srcElement.attributes.id.value;

    this.solutionsModels.forEach((model: any) => {
      if (model.id == modelId) {
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
      }
    });
  }

  public clearSelection() {
    d3.selectAll('.brushing').remove();
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
}
