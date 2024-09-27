import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class OrdersPage implements OnInit {
  orders: any;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private datePipe: DatePipe
  ) {}

  async retrieveOrders() {
    await this.dataservice
      .doOrdersGet(
        this.dataservice.global_auth.token,
        `${this.dataservice.global_auth.id}`
      )
      .then((resp: any) => {
        this.orders = resp.data;
        console.log('orders', this.orders);
      });
  }

  formatDate(date: any) {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return formattedDate;
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  async updateCart(id: any) {
    await this.dataservice
      .doProductGet(id)
      .then((product: any) => {
        const product_res = product.data;
        if (product_res.id) {
          this.util.updateCart(
            product_res.id,
            product_res,
            product_res.images,
            '1'
          );
        } else {
          this.util.presentAlertToast(
            'Item is currently out-of-stock!',
            'alert-circle',
            'danger'
          );
        }
      })
      .then((e: any) => {
        console.log('Any error occured ', e);
      });
  }

  cancelOrder(id: any) {
    let data = {
      status: 'cancelled',
    };
    this.dataservice.doUpdateOrder(id, data).then(() => {
      this.retrieveOrders();
      this.util.presentAlertToast(`Order #${id} Cancelled`, 'car', 'd2dblue');
    });
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.retrieveOrders();
  }
}
