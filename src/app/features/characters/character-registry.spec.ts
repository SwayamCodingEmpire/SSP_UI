import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterRegistry } from './character-registry';

describe('CharacterRegistry', () => {
  let component: CharacterRegistry;
  let fixture: ComponentFixture<CharacterRegistry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterRegistry],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterRegistry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
