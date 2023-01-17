import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbservicesComponent } from './dbservices.component';

describe('DbservicesComponent', () => {
  let component: DbservicesComponent;
  let fixture: ComponentFixture<DbservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DbservicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
