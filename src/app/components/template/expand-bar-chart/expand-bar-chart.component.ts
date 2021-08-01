import { style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import { Solution } from '../../model/solution.model';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-expand-bar-chart',
  templateUrl: './expand-bar-chart.component.html',
  styleUrls: ['./expand-bar-chart.component.css'],
})
export class ExpandBarChartComponent implements OnInit {
  private solutions: Solution[] = [];
  private selectedSolution: any;
  private barChartData: any;
  private barChartAttributes: any;

  private attributesKeys: string[] = [];

  public pen?: number;
  public totalSum?: number;

  private barHeight: string = '20px';

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.selectedSolution = this.route.snapshot.params.solution;
    this.solutions = await this.homeService.getSolutions().toPromise();

    this.barChartData = this.solutions[this.selectedSolution].barChart;

    this.barChartAttributes = this.barChartData.attributes;

    this.attributesKeys = this.barChartAttributes.map(
      (attribute: any) => attribute.name
    );

    this.showInfos();
    this.drawOriginalBarChart();
    this.drawRMFinderBarChart();
    this.drawDifferenceBarChart();
  }

  private showInfos() {
    this.pen = this.barChartData.pen;
    this.totalSum = this.barChartData.totalSum;

    //Add Attributes
    d3.select('#containerAttr')
      .selectAll('p')
      .data(this.barChartAttributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .attr('id', (d: any) => `attribute${d.name}`)
      .style('margin-bottom', '0px')
      .text((d: any) => d.name)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Original values
    d3.select('#containerOriginal')
      .selectAll('p')
      .data(this.barChartAttributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d: any) => `original${d.name}`)
      .text((d: any) => `(${d.original})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add RMFinder values
    d3.select('#containerRMFinder')
      .selectAll('p')
      .data(this.barChartAttributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d: any) => `rmFinder${d.name}`)
      .text((d: any) => `(${d.rmFinder})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Difference values
    d3.select('#containerDifference')
      .selectAll('p')
      .data(this.barChartAttributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d: any) => `difference${d.name}`)
      .text((d: any) => `(${d.difference})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Sum values
    d3.select('#containerSum')
      .selectAll('p')
      .data(this.barChartAttributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d: any) => `sum${d.name}`)
      .text((d: any) => d.sum)
      .on('click', (element, attr) => this.clickAttr(attr));
  }

  private drawOriginalBarChart() {
    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartOriginal`)
      .selectAll('div')
      .data(this.barChartAttributes)
      .join('div')
      .attr('id', (d, i) => `attributeOriginal${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d: any) => d.name.toUpperCase());

    this.barChartAttributes.map((attribute: any, index: number) => {
      d3.select(`#attributeOriginal${index}`)
        .append('div')
        .selectAll('svg')
        .data(attribute.original)
        .join('svg')
        .attr('height', this.barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', this.barHeight);
    });
  }

  private drawRMFinderBarChart() {
    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartRMFinder`)
      .selectAll('div')
      .data(this.barChartAttributes)
      .join('div')
      .attr('id', (d, i) => `attributeRMFinder${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d: any) => d.name.toUpperCase());

    this.barChartAttributes.map((attribute: any, index: number) => {
      d3.select(`#attributeRMFinder${index}`)
        .append('div')
        .selectAll('svg')
        .data(attribute.rmFinder)
        .join('svg')
        .attr('height', this.barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', this.barHeight);
    });
  }

  private drawDifferenceBarChart() {
    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartDifference`)
      .selectAll('div')
      .data(this.barChartAttributes)
      .join('div')
      .attr('id', (d, i) => `attributeDifference${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d: any) => d.name.toUpperCase());

    this.barChartAttributes.map((attribute: any, index: number) => {
      d3.select(`#attributeDifference${index}`)
        .append('div')
        .selectAll('svg')
        .data(attribute.difference)
        .join('svg')
        .attr('height', this.barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', this.barHeight);
    });
  }

  private borderChartsFreq0(data: any) {
    if (data <= 0.0) {
      return 'solid medium red';
    } else {
      return 'solid medium gray';
    }
  }

  private clickAttr(attr: any) {
    d3.selectAll('p').style('background-color', '');
    d3.selectAll('div').style('background-color', '');

    if (typeof attr == 'object') {
      attr = Object.values(attr)[0];
    }

    d3.select(`#attribute${attr}`).style('background-color', 'lightblue');
    d3.select(`#original${attr}`).style('background-color', 'lightblue');
    d3.select(`#rmFinder${attr}`).style('background-color', 'lightblue');
    d3.select(`#difference${attr}`).style('background-color', 'lightblue');
    d3.select(`#sum${attr}`).style('background-color', 'lightblue');

    this.attributesKeys.map((data, i) => {
      if (data == attr) {
        d3.select(`#attributeOriginal${i}`).style(
          'background-color',
          'lightblue'
        );
        d3.select(`#attributeRMFinder${i}`).style(
          'background-color',
          'lightblue'
        );
        d3.select(`#attributeDifference${i}`).style(
          'background-color',
          'lightblue'
        );
      }
    });
  }
}
