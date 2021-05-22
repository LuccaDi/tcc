import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedRiskCurvesComponent } from './combined-risk-curves.component';

describe('CombinedRiskCurvesComponent', () => {
  let component: CombinedRiskCurvesComponent;
  let fixture: ComponentFixture<CombinedRiskCurvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CombinedRiskCurvesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedRiskCurvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
