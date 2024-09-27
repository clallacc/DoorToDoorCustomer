import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddpaymentPage } from './addpayment.page';

describe('AddpaymentPage', () => {
  let component: AddpaymentPage;
  let fixture: ComponentFixture<AddpaymentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddpaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
