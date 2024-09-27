import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicSlides, ToastController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { RouterModule } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-shoplist',
  templateUrl: './shoplist.page.html',
  styleUrls: ['./shoplist.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShoplistPage implements OnInit {
  shoppinglist: any;
  deviceOs: any;
  productInterests: any = [];
  view_loading: any;
  onsaleProducts: any;
  swiperModules = [IonicSlides];

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  removeItemFromList(id: any) {
    const index = this.shoppinglist.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.shoppinglist.splice(index, 1);
    }
    this.dataservice.doStoreShoppingList(JSON.stringify(this.shoppinglist));
  }

  updateCart(id: any, data: any, images?: any, quantity?: any) {
    this.util.updateCart(id, data, images, quantity);
  }

  loadShoplist() {
    this.shoppinglist = this.dataservice.global_shopping_list;
    this.shoppinglist.forEach((listProducts: any) => {
      if (!listProducts.quantity) {
        listProducts.quantity = '1';
      }
    });
  }

  addAllToCart() {
    this.shoppinglist.forEach((item: any) => {
      this.updateCart(item.id, item, item.images[0].src, item.quantity);
    });
    alert('Shopping list added to cart!');
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    this.util.addToShoppingList(id, data, images, quantity);
    this.shoppinglist = this.dataservice.global_shopping_list;
  }

  calculateItemTotal(price: number, qty: number) {
    const total = price * qty;
    return total.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  updateQuantity(id: number, quantity: number, concat: string) {
    if (concat === '+') {
      quantity++;
    }
    if (concat === '-' && quantity > 1) {
      quantity--;
    }
    const updatedShoppingList = this.shoppinglist.find(
      (item: any) => item.id === id
    );
    if (updatedShoppingList) {
      updatedShoppingList.quantity = `${quantity}`; // Update the quantity
    }
    this.dataservice.doStoreShoppingList(JSON.stringify(this.shoppinglist));
  }

  // GET ALL PRODUCTS
  async getProductOnSale() {
    // load cached data
    this.dataservice
      .doGetSaleProductsCache()
      .then((sale_cached: any) => {
        if (sale_cached.value) {
          this.onsaleProducts = JSON.parse(sale_cached.value);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  ionViewDidEnter() {
    this.loadShoplist();
  }

  ngOnInit() {
    this.deviceOs = this.dataservice.global_OS;
    this.getProductOnSale();
  }
}
