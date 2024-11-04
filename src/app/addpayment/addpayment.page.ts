import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-addpayment',
  templateUrl: './addpayment.page.html',
  styleUrls: ['./addpayment.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddpaymentPage implements OnInit {
  card_number: any = '';
  first_name: any = '';
  last_name: any = '';
  expiry: any = '';
  cvv: any = '';
  use_default_address: any = 'true';
  use_default_card: any = '1';
  user_details: any;
  expiry_year: any[] = [];
  expiry_month: any;
  card_expiry_year: any = '';
  card_expiry_month: any = '';
  yearpopover_disabled: any = true;
  showStoreCards: any;

  constructor(private dataservice: DataService, private util: UtilService) {}

  setupExpiryData() {
    let currentYear = new Date().getFullYear();
    for (let i = 1; i < 20; i++) {
      this.expiry_year.push({
        year_full: currentYear,
        year_abr: currentYear.toString().slice(-2),
      });
      currentYear++;
    }

    this.expiry_month = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];
  }

  onDidDismiss(event: any) {
    console.log('didDismiss', JSON.stringify(event.detail));
  }

  savecard() {
    const fname_abriv = this.first_name.substring(0, 2);
    const lname_abriv = this.last_name.substring(0, 2);
    const createdformattedDate =
      this.dataservice.global_auth.customer.date_created.replace(/-/g, '');
    const signupdate = createdformattedDate.substring(0, 8);
    if (!this.use_default_address) {
      this.use_default_address = 'false';
    }
    if (!this.use_default_card) {
      this.use_default_card = '0';
    }
    let card_data = {
      email: this.dataservice.global_auth.email,
      order_id: `${fname_abriv.toUpperCase()}${lname_abriv.toUpperCase()}${
        this.dataservice.global_auth.id
      }${signupdate}`,
      card_number: `${this.card_number}`,
      cvv: `${this.cvv}`,
      expiry: `${this.card_expiry_year}${this.card_expiry_month}`,
      name: `${this.first_name} ${this.last_name}`,
    };
    this.dataservice
      .doPlaceOrderStoreCC(card_data, this.user_details.token)
      .then((data: any) => {
        console.log('CC purchase data', data);
      })
      .catch((e) =>
        this.util.presentAlertToast(
          `Somthing went wrong: ${e}`,
          'alert-outline',
          'light'
        )
      );
  }

  showCardIcon(cardType: any) {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return '/assets/icon/visa.svg';
      case 'mastercard':
        return '/assets/icon/mastercard.svg';
      default:
        return '/assets/icon/creditcard.svg';
    }
  }

  setDefaultCard(index: any) {
    this.user_details.payment_methods.forEach((method: any) => {
      if (method.default_card === '1') {
        method.default_card = '0';
      }
    });

    this.user_details.payment_methods[index].default_card = '1';
    this.user_details.default_payment = 'ggfac';
    this.user_details.default_payment_title = 'Pay Online VISA or MASTERCARD';
    this.dataservice.doSaveUser(JSON.stringify(this.user_details));
  }

  ngOnInit() {
    this.user_details = this.dataservice.global_auth;
    this.setupExpiryData();
  }
}
