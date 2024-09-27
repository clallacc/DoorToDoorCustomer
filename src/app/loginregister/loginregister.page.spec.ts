import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginregisterPage } from './loginregister.page';

describe('LoginregisterPage', () => {
  let component: LoginregisterPage;
  let fixture: ComponentFixture<LoginregisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoginregisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
