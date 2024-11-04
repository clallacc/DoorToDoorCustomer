import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SentnotificationPage } from './sentnotification.page';

describe('SentnotificationPage', () => {
  let component: SentnotificationPage;
  let fixture: ComponentFixture<SentnotificationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SentnotificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
