import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneTimeline } from './scene-timeline';

describe('SceneTimeline', () => {
  let component: SceneTimeline;
  let fixture: ComponentFixture<SceneTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
