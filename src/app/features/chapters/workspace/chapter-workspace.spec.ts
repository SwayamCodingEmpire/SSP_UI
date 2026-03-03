import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterWorkspace } from './chapter-workspace';

describe('ChapterWorkspace', () => {
  let component: ChapterWorkspace;
  let fixture: ComponentFixture<ChapterWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(ChapterWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
