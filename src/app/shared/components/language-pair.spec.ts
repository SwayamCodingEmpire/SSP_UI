import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagePair } from './language-pair';

describe('LanguagePair', () => {
  let component: LanguagePair;
  let fixture: ComponentFixture<LanguagePair>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguagePair],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagePair);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
