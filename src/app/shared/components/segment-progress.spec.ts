import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentProgress } from './segment-progress';

describe('SegmentProgress', () => {
  let component: SegmentProgress;
  let fixture: ComponentFixture<SegmentProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentProgress],
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
