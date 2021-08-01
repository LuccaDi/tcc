import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpandChartComponent } from './components/template/expand-chart/expand-chart.component';
import { HomeComponent } from './components/template/home/home.component';
import { ExpandBarChartComponent } from './components/template/expand-bar-chart/expand-bar-chart.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'expandChart/:chart/:solution/:id',
    component: ExpandChartComponent,
  },
  {
    path: 'expandBarChart/:solution',
    component: ExpandBarChartComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
