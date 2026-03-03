import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncPulse } from './async-pulse';

describe('AsyncPulse', () => {
  let component: AsyncPulse;
  let fixture: ComponentFixture<AsyncPulse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsyncPulse],
    }).compileComponents();

    fixture = TestBed.createComponent(AsyncPulse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
