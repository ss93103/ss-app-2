import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksitePage } from './worksite.page';

describe('WorksitePage', () => {
  let component: WorksitePage;
  let fixture: ComponentFixture<WorksitePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksitePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
