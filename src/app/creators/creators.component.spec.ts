import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorsComponent } from './creators.component';
import { describe } from 'node:test';

describe('CreatorComponent', () => {
  let component: CreatorsComponent;
  let fixture: ComponentFixture<CreatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});