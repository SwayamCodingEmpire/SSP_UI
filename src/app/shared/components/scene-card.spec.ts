import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneCard } from './scene-card';

describe('SceneCard', () => {
  let component: SceneCard;
  let fixture: ComponentFixture<SceneCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
