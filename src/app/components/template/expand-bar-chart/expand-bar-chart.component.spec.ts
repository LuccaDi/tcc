import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandBarChartComponent } from './expand-bar-chart.component';

describe('ExpandBarChartComponent', () => {
  let component: ExpandBarChartComponent;
  let fixture: ComponentFixture<ExpandBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
