import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandChartComponent } from './expand-chart.component';

describe('ExpandChartComponent', () => {
  let component: ExpandChartComponent;
  let fixture: ComponentFixture<ExpandChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
