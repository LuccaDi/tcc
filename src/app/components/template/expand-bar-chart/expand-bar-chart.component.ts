import { style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-expand-bar-chart',
  templateUrl: './expand-bar-chart.component.html',
  styleUrls: ['./expand-bar-chart.component.css'],
})
export class ExpandBarChartComponent implements OnInit {
  private tempData = [
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

  constructor() {}

  ngOnInit(): void {
    this.showInfos();
    this.drawOriginalBarChart();
    this.drawRMFinderBarChart();
    this.drawDifferenceBarChart();
  }

  public pen: number = 7;
  public totalSum: number = 2.003;

  private showInfos() {
    let attributes: any = [];

    this.tempData.map((d, i) => {
      attributes[i] = Object.keys(d)[0];
    });

    //Add Attributes
    d3.select('#containerAttr')
      .selectAll('p')
      .data(attributes)
      .join('p')
      .style('border-bottom', '1px solid black')
      .attr('id', (d) => `attribute${d}`)
      .style('margin-bottom', '0px')
      .text((d: any) => d)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Original values
    d3.select('#containerOriginal')
      .selectAll('p')
      .data(this.tempData)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d) => `original${Object.keys(d)[0]}`)
      .text((d: any, i) => `(${d[attributes[i]].original})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add RMFinder values
    d3.select('#containerRMFinder')
      .selectAll('p')
      .data(this.tempData)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d) => `rmFinder${Object.keys(d)[0]}`)
      .text((d: any, i) => `(${d[attributes[i]].rmFinder})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Difference values
    d3.select('#containerDifference')
      .selectAll('p')
      .data(this.tempData)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d) => `difference${Object.keys(d)[0]}`)
      .text((d: any, i) => `(${d[attributes[i]].difference})`)
      .on('click', (element, attr) => this.clickAttr(attr));

    //Add Sum values
    d3.select('#containerSum')
      .selectAll('p')
      .data(this.tempData)
      .join('p')
      .style('border-bottom', '1px solid black')
      .style('margin-bottom', '0px')
      .attr('id', (d) => `sum${Object.keys(d)[0]}`)
      .text((d: any, i) => d[attributes[i]].sum)
      .on('click', (element, attr) => this.clickAttr(attr));
  }

  private drawOriginalBarChart() {
    let attributes: any = [];
    const barHeight: string = '20px';

    this.tempData.map((d, i) => {
      attributes[i] = Object.keys(d)[0];
    });

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartOriginal`)
      .selectAll('div')
      .data(this.tempData)
      .join('div')
      .attr('id', (d, i) => `attributeOriginal${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d, i) => attributes[i].toUpperCase());

    this.tempData.map((data: any, i) => {
      d3.select(`#attributeOriginal${i}`)
        .append('div')
        .selectAll('svg')
        .data(data[attributes[i]].original)
        .join('svg')
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', barHeight);
    });
  }

  private drawRMFinderBarChart() {
    let attributes: any = [];
    const barHeight: string = '20px';

    this.tempData.map((d, i) => {
      attributes[i] = Object.keys(d)[0];
    });

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartRMFinder`)
      .selectAll('div')
      .data(this.tempData)
      .join('div')
      .attr('id', (d, i) => `attributeRMFinder${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d, i) => attributes[i].toUpperCase());

    this.tempData.map((d: any, i) => {
      d3.select(`#attributeRMFinder${i}`)
        .append('div')
        .selectAll('svg')
        .data(d[attributes[i]].rmFinder)
        .join('svg')
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', barHeight);
    });
  }

  private drawDifferenceBarChart() {
    let attributes: any = [];
    const barHeight: string = '20px';

    this.tempData.map((d, i) => {
      attributes[i] = Object.keys(d)[0];
    });

    // Create the X-axis band scale
    const x = d3.scaleLinear().domain([0, 1]).range([0, 45]);

    const barChart = d3
      .select(`#barChartDifference`)
      .selectAll('div')
      .data(this.tempData)
      .join('div')
      .attr('id', (d, i) => `attributeDifference${i}`)
      .style('display', 'flex')
      .attr('class', 'barChart');

    barChart
      .append('div')
      .style('width', '45px')
      .append('p')
      .style('margin-right', '5px')
      .text((d, i) => attributes[i].toUpperCase());

    this.tempData.map((d: any, i) => {
      d3.select(`#attributeDifference${i}`)
        .append('div')
        .selectAll('svg')
        .data(d[attributes[i]].difference)
        .join('svg')
        .attr('height', barHeight)
        .attr('width', '40px')
        .style('border', (d) => this.borderChartsFreq0(d))
        .style('margin-left', '7px')
        .append('g')
        .attr('fill', 'darkblue')
        .append('rect')
        .attr('x', x(0))
        .attr('width', (d: any) => x(d) - x(0))
        .attr('height', barHeight);
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
      attr = Object.keys(attr)[0];
    }

    d3.select(`#attribute${attr}`).style('background-color', 'lightblue');
    d3.select(`#original${attr}`).style('background-color', 'lightblue');
    d3.select(`#rmFinder${attr}`).style('background-color', 'lightblue');
    d3.select(`#difference${attr}`).style('background-color', 'lightblue');
    d3.select(`#sum${attr}`).style('background-color', 'lightblue');

    this.tempData.map((data, i) => {
      if (Object.keys(data)[0] == attr) {
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
