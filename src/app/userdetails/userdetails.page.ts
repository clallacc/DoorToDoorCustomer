import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-userdetails',
  templateUrl: './userdetails.page.html',
  styleUrls: ['./userdetails.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UserdetailsPage implements OnInit {
  location_listing: any;
  billing_city_locations: any = ['Please choose a Municipality.'];
  billing_address_1: string = '';
  billing_address_2: string = '';
  billing_city: string = '';
  billing_company: string = '';
  billing_country: string = 'TT';
  billing_phone: string = '';
  billing_postcode: string = '00000';
  billing_state: string = '';
  delivery_city_locations: any = ['Please choose a Municipality.'];
  delivery_address_1: string = '';
  delivery_address_2: string = '';
  delivery_city: string = '';
  delivery_state: string = '';
  delivery_use_billing = false;
  valid_phone = '';
  keep_billing_address = false;

  constructor(private util: UtilService, private dataservice: DataService) {}

  billingCitySelections(e: any) {
    switch (e.detail.value) {
      case 'Arima':
        this.billing_city_locations = this.location_listing[0].cities;
        break;
      case 'Diego Martin':
        this.billing_city_locations = this.location_listing[1].cities;
        console.log(this.billing_city_locations);
        break;
      case 'Port of Spain':
        this.billing_city_locations = this.location_listing[2].cities;
        break;
      case 'Tunapuna–Piarco':
        this.billing_city_locations = this.location_listing[3].cities;
        break;

      default:
        this.billing_city_locations = ['Please choose a City.'];
        console.log(this.billing_city_locations);
    }
    console.log('cities', e.detail.value);
  }

  deliveryCitySelections(e: any) {
    switch (e.detail.value) {
      case 'Arima':
        this.delivery_city_locations = this.location_listing[0].cities;
        break;
      case 'Diego Martin':
        this.delivery_city_locations = this.location_listing[1].cities;
        console.log(this.delivery_city_locations);
        break;
      case 'Port of Spain':
        this.delivery_city_locations = this.location_listing[2].cities;
        break;
      case 'Tunapuna–Piarco':
        this.delivery_city_locations = this.location_listing[3].cities;
        break;

      default:
        this.delivery_city_locations = ['Please choose a City.'];
        console.log(this.delivery_city_locations);
    }
    console.log('cities', e.detail.value);
  }

  populateDeliveryAddress() {
    this.delivery_use_billing = true;
    this.delivery_address_1 = this.billing_address_1;
    this.delivery_address_2 = this.billing_address_2;
    this.delivery_city = this.billing_city;
    this.delivery_state = this.billing_state;
    this.keep_billing_address = true;
  }

  validatePhoneNumber(phoneNumber: any) {
    // // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.detail.value.replace(/\D/g, '');

    // Check if the cleaned number is a valid 7-digit phone number
    const regex = /^\d{10}$/;
    if (!regex.test(cleanedNumber)) {
      // Invalid phone number
      this.valid_phone = 'color:#F44336';
    } else {
      // Add "868" prefix to the cleaned number
      const prefixedNumber = `868${cleanedNumber}`;

      // Format the phone number as (868) 123-4567
      this.billing_phone = `(${prefixedNumber.slice(
        3,
        6
      )}) ${prefixedNumber.slice(6, 9)}-${prefixedNumber.slice(9)}`;
      this.valid_phone = '';
      console.log(this.billing_phone);
    }
  }

  setupAddressData() {
    // billing data
    this.billing_address_1 =
      this.dataservice.global_auth.customer?.billing?.address_1;
    this.billing_address_2 =
      this.dataservice.global_auth.customer?.billing?.address_2;
    this.billing_company =
      this.dataservice.global_auth.customer?.billing?.company;
    this.billing_phone = this.dataservice.global_auth.customer?.billing?.phone;
    this.billing_city = this.dataservice.global_auth.customer?.billing?.city;
    this.billing_state = this.dataservice.global_auth.customer?.billing?.state;

    // shipping data
    this.delivery_address_1 =
      this.dataservice.global_auth.customer?.shipping?.address_1;
    this.delivery_address_2 =
      this.dataservice.global_auth.customer?.shipping?.address_2;
    this.delivery_city = this.dataservice.global_auth.customer?.shipping?.city;
    this.delivery_state =
      this.dataservice.global_auth.customer?.shipping?.state;
    this.keep_billing_address = false;
  }

  setDeliveryAddress() {
    let customerData = {};

    if (this.billing_address_1 && this.billing_city && this.billing_state) {
      customerData = {
        ...customerData,
        billing: {
          first_name: this.dataservice.global_auth.firstName,
          last_name: this.dataservice.global_auth.lastName,
          company: this.billing_company,
          address_1: this.billing_address_1,
          address_2: this.billing_address_2,
          city: this.billing_city,
          state: this.billing_state,
          postcode: this.billing_postcode,
          country: this.billing_country,
          email: this.dataservice.global_auth.email,
          phone: this.billing_phone,
        },
      };
    }
    if (this.delivery_address_1 && this.delivery_city && this.delivery_state) {
      customerData = {
        ...customerData,
        shipping: {
          first_name: this.dataservice.global_auth.firstName,
          last_name: this.dataservice.global_auth.lastName,
          company: this.billing_company,
          address_1: this.delivery_address_1,
          address_2: this.delivery_address_2,
          city: this.delivery_city,
          state: this.delivery_state,
          postcode: this.billing_postcode,
          country: this.billing_country,
          email: this.dataservice.global_auth.email,
          phone: this.billing_phone,
        },
      };
    }
    this.dataservice
      .doUpdateUserAddress(this.dataservice.global_auth.id, customerData)
      .then((confirmation: any) => {
        if (confirmation.data) {
          this.dataservice.global_auth.customer = confirmation.data;
          this.dataservice.doSaveUser(
            JSON.stringify(this.dataservice.global_auth)
          );
          alert('Account updated');
        }
        console.log(
          'this.dataservice.global_auth',
          this.dataservice.global_auth
        );
        console.log('customerData', confirmation.data);
        const userdataUpdated = this.util.RefreshCustomerData();
        console.log('userdataUpdated', userdataUpdated);
      })
      .catch((e) => alert('Account updated:' + e));
  }

  ngOnInit() {
    this.location_listing = this.util.d2dLocations()[0].addresses;
    this.setupAddressData();
  }
}
