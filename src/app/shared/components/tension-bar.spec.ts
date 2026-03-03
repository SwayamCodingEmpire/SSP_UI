import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TensionBar } from './tension-bar';

describe('TensionBar', () => {
  let component: TensionBar;
  let fixture: ComponentFixture<TensionBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TensionBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TensionBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
