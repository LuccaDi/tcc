import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

import { HeaderComponent } from './components/template/header/header.component';
import { HomeComponent } from './components/template/home/home.component';
import { ExpandChartComponent } from './components/template/expand-chart/expand-chart.component';
import { ExpandBarChartComponent } from './components/template/expand-bar-chart/expand-bar-chart.component';
import { CombinedRiskCurvesComponent } from './components/template/combined-risk-curves/combined-risk-curves.component';
import { SelectFileComponent } from './components/template/select-file/select-file.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    ExpandChartComponent,
    ExpandBarChartComponent,
    CombinedRiskCurvesComponent,
    SelectFileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    HttpClientModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
