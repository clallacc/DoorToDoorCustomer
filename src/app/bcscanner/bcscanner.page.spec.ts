import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BcscannerPage } from './bcscanner.page';

describe('BcscannerPage', () => {
  let component: BcscannerPage;
  let fixture: ComponentFixture<BcscannerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BcscannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
