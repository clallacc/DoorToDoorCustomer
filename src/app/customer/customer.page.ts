import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class CustomerPage implements OnInit {
  customers: any;
  orders: any;
  location_listing: any;
  city_locations: any = ['Please choose a Municipality.'];
  address_1: string = '';
  address_2: string = '';
  city: string = '';
  company: string = '';
  country: string = '';
  phone: string = '';
  postcode: string = '00000';
  state: string = '';

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private datePipe: DatePipe
  ) {}

  async retrieveCustomerDetails() {
    this.customers = this.dataservice.global_auth;
    this.location_listing = this.util.d2dLocations()[0].addresses;
  }

  citySelections(e: any) {
    switch (e.detail.value) {
      case 'Arima':
        this.city_locations = this.location_listing[0].cities;
        break;
      case 'Diego Martin':
        this.city_locations = this.location_listing[1].cities;
        console.log(this.city_locations);
        break;
      case 'Port of Spain':
        this.city_locations = this.location_listing[2].cities;
        break;
      case 'Tunapuna–Piarco':
        this.city_locations = this.location_listing[3].cities;
        break;

      default:
        this.city_locations = ['Please choose a City.'];
        console.log(this.city_locations);
    }
  }

  async retrieveOrders() {
    await this.dataservice
      .doOrdersGet(
        this.dataservice.global_auth.token,
        `${this.dataservice.global_auth.id}`
      )
      .then((resp: any) => {
        if (resp.data) {
          this.orders = resp.data[0].line_items;
        }
      });
  }

  async orderAgain() {
    let index = 0;
    await this.orders.forEach((serverProducts: any) => {
      this.dataservice
        .doProductGet(serverProducts.product_id)
        .then((productData: any) => {
          delete productData.data['meta_data'];
          productData.data.quantity = serverProducts.quantity;
          productData.data.sub_total =
            Number(productData.data.price) * Number(serverProducts.quantity);
          this.updateCartWithPreOrder(productData.data);
        })
        .catch(() => {
          console.log('Error getting Product Details.');
        });
      index++;
    });
    if (index === this.orders.length) {
      // Update cart and shopping list
      this.dataservice.doStoreInCart(
        JSON.stringify(this.dataservice.global_cart)
      );
      alert('Items added to cart!');
    }
  }

  async updateCartWithPreOrder(orderitem: any) {
    if (this.dataservice.global_cart) {
      let filterOrder = this.dataservice.global_cart.filter(
        (list: any) => list.id === orderitem.id
      );
      if (filterOrder.length === 0) {
        this.dataservice.global_cart.push(orderitem);
      }
    } else {
      this.dataservice.global_cart = orderitem;
    }
  }

  formatDate(date: any) {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return formattedDate;
  }

  setDeliveryAddress() {
    console.log('address set');
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  ngOnInit() {
    this.retrieveCustomerDetails();
    this.retrieveOrders();
  }
}
