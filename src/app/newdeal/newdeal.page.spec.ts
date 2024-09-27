import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewdealPage } from './newdeal.page';

describe('NewdealPage', () => {
  let component: NewdealPage;
  let fixture: ComponentFixture<NewdealPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewdealPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
