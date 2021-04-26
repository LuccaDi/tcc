import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpandChartComponent } from './components/template/expand-chart/expand-chart.component';
import { HomeComponent } from './components/template/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'expandChart/:id',
    component: ExpandChartComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
