import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntryForm } from './add-entry-form';

describe('AddEntryForm', () => {
  let component: AddEntryForm;
  let fixture: ComponentFixture<AddEntryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEntryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEntryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
