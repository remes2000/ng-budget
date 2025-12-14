import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCategory } from './select-category';

describe('SelectCategory', () => {
  let component: SelectCategory;
  let fixture: ComponentFixture<SelectCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
