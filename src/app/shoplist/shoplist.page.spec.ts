import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoplistPage } from './shoplist.page';

describe('ShoplistPage', () => {
  let component: ShoplistPage;
  let fixture: ComponentFixture<ShoplistPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ShoplistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
