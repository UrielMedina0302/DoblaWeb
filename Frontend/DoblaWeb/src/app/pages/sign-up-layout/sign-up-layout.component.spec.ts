import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpLayoutComponent } from './sign-up-layout.component';

describe('SignUpLayoutComponent', () => {
  let component: SignUpLayoutComponent;
  let fixture: ComponentFixture<SignUpLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
