import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SspLoader } from './ssp-loader';

describe('SspLoader', () => {
  let component: SspLoader;
  let fixture: ComponentFixture<SspLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SspLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(SspLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
