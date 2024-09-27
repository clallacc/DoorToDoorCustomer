import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-newdeal',
  templateUrl: './newdeal.page.html',
  styleUrls: ['./newdeal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewdealPage implements OnInit {
  new_deals: any;
  content_loading: any = true;
  notification: any;
  deal_products: any = [];
  constructor(private dataservice: DataService, private util: UtilService) {}

  async loadNewDeals() {
    if (this.notification.notification.data?.post) {
      await this.dataservice
        .doGetDealsPosts(this.notification.notification.data?.post)
        .then((data: any) => {
          this.new_deals = data.data;
          this.content_loading = false;
        });
    } else if (this.notification.notification.data?.page) {
      this.loadPageData(this.notification.notification.data?.page);
    } else {
      this.dataservice.doGetDealsPosts('466').then((data: any) => {
        this.new_deals = data.data;
        this.content_loading = false;
      });
    }
  }

  async loadPageData(page: any) {
    await this.dataservice.doGetPageById(page).then((list: any) => {
      const html = list.data.content.rendered;
      // Create a temporary element to parse the HTML

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const productLinks = doc.querySelectorAll('.add-cart a');
      const productIds = Array.from(productLinks).map((link) =>
        link.getAttribute('data-product_id')
      );
      if (productIds) {
        productIds.forEach((list_productIds: any) => {
          this.dataservice
            .doProductGet(list_productIds)
            .then((synced_product: any) => {
              this.deal_products.push(synced_product.data);
              this.content_loading = false;
            });
        });
      }
    });
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    this.util.addToShoppingList(id, data, images, quantity);
  }

  updateCart(id: any, data: any, images?: any, quantity?: any) {
    this.util.updateCart(id, data, images, quantity);
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  fiximgUrl(url: any) {
    let newUrl;
    newUrl = url.replace('i0.wp.com/', '');
    return newUrl;
  }

  ngOnInit() {
    this.loadNewDeals();
  }
}
