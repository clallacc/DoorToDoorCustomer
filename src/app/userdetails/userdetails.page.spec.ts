import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserdetailsPage } from './userdetails.page';

describe('UserdetailsPage', () => {
  let component: UserdetailsPage;
  let fixture: ComponentFixture<UserdetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
