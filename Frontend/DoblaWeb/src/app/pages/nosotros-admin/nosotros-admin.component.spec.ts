import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NosotrosAdminComponent } from './nosotros-admin.component';

describe('NosotrosAdminComponent', () => {
  let component: NosotrosAdminComponent;
  let fixture: ComponentFixture<NosotrosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NosotrosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NosotrosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
