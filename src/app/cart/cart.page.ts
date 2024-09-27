import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { IonicModule, IonicSlides, ToastController } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { Router, RouterModule } from '@angular/router';
import { UtilService } from '../services/util.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-cart',
  templateUrl: 'cart.page.html',
  styleUrls: ['cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartPage {
  cart: any;
  removeFromCart: any;
  total: any = 0;
  totalitems: any = 0;
  itemTotal: any = 0;
  cartempty: any = true;
  onlineCart: any;
  quickbuy: any;
  swiperModules = [IonicSlides];
  deviceOs: any;
  view_loading: any;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private location: Location,
    private router: Router
  ) {}

  async removeCartItem(id: any) {
    const index = this.cart.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.cart.splice(index, 1);
    }
    this.dataservice.doStoreInCart(JSON.stringify(this.cart));
    this.calculateTotal();
    this.retrieveUserCart(this.dataservice.global_auth.token);
  }

  calculateItemTotal(quantity: any, price: any) {
    var itemTotal = Number(quantity * price);
    const formattedCurrency = itemTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formattedCurrency;
  }

  calculateTotal() {
    this.total = 0;
    this.totalitems = 0;

    if (this.cart) {
      for (let cartItems of this.cart) {
        this.totalitems += Number(cartItems.quantity);
        this.total += Number(cartItems.sub_total);
      }
      this.total = this.total.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      this.cartempty = false;
    } else {
      this.cartempty = true;
    }
  }

  getQuickBuy() {
    this.dataservice.doGetProductsInCategory('119').then((data: any) => {
      this.quickbuy = data.data;
    });
  }

  goBack() {
    this.location.back();
  }

  updateQuantity(id: any, quantity: any) {
    var removeditem = this.cart.filter((product: any) => product.id === id);
    delete removeditem['quantity'];
    delete removeditem['sub_total'];
    removeditem.map((items: any) => {
      removeditem = [
        {
          ...items,
          quantity: quantity,
          sub_total: removeditem[0].price * quantity,
        },
      ];
    });
  }

  quantityUp(id: any, quantity: any) {
    quantity++;
    this.updateQuantity(id, quantity);
    const index = this.cart.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      this.cart[index].quantity = quantity;
      this.cart[index].sub_total = this.cart[index].price * quantity;
    }
    this.dataservice.doStoreInCart(JSON.stringify(this.cart));
    this.calculateTotal();
  }

  quantityDown(id: any, quantity: any) {
    if (quantity > 1) {
      quantity--;
      const index = this.cart.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        this.cart[index].quantity = quantity;
        this.cart[index].sub_total = this.cart[index].price * quantity;
      }
    } else {
      this.removeCartItem(id);
    }
    this.dataservice.doStoreInCart(JSON.stringify(this.cart));
    this.calculateTotal();
  }

  emptyCart() {
    this.dataservice.global_cart = [];
    this.dataservice.doRemoveCart();
    this.cart = this.dataservice.global_cart;
    this.retrieveUserCart(this.dataservice.global_auth.token);
    this.calculateTotal();
  }

  calculateSavings(regPrice: any, price: any, quant: any) {
    const savings = (regPrice - price) * quant;
    return savings.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  updateCart(id: any, data: any, images?: any, quantity?: any) {
    this.util.updateCart(id, data, images, quantity);
  }

  async updateCartSync(id: any, images?: any, quantity?: any) {
    await this.dataservice.doProductGet(id).then((product: any) => {
      this.util.updateCart(id, product.data, images, quantity);
      console.log('product', product.data);
    });
    this.retrieveUserCart(this.dataservice.global_auth.token);
    this.calculateTotal();
    // Update view after item added
    this.cart = this.dataservice.global_cart;
  }

  async updateCartSyncAll() {
    this.onlineCart.forEach((cartItems: any) => {
      this.updateCartSync(
        cartItems.id,
        cartItems.images[0],
        cartItems.quantity
      );
    });
    this.retrieveUserCart(this.dataservice.global_auth.token);
    this.calculateTotal();
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    this.util.addToShoppingList(id, data, images, quantity);
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  removeViewedIfInCart() {
    for (let i = 0; i < this.cart.length; i++) {
      const index = this.dataservice.global_recent_view.findIndex(
        (item: any) => item.id === this.cart[i].id
      );
      if (index !== -1) {
        this.dataservice.global_recent_view.splice(index, 1);
        this.dataservice.doStoreRecentViewed(
          JSON.stringify(this.dataservice.global_recent_view)
        );
      }
    }
  }

  async retrieveUserCart(jwt_token: any) {
    if (this.dataservice.global_auth.token) {
      this.view_loading = true;
      await this.dataservice.doGetCartItems(jwt_token).then((cartdata: any) => {
        this.onlineCart = cartdata.data;
        this.cart.forEach((shopcart: any) => {
          this.onlineCart = this.onlineCart.filter(
            (item: any) => item.id !== shopcart.id
          );
        });
        this.view_loading = false;
      });
    }
  }

  async scheduleLocalNotification() {
    const delay = 5 * 60 * 1000; // 4 minutes in milliseconds
    // const delay = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: 'DoortoDoorTT',
          body: `It appears that your cart contains items like ${this.cart[0].name} 🛒. To proceed with your purchase, you have the option to proceed to checkout.`,
          smallIcon: 'house',
          actionTypeId: 'OPEN_PRODUCT',
          schedule: { at: new Date(Date.now() + delay) },
          extra: null,
        },
      ],
    });
    // Add a listener for notification click event
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notificationAction) => {
        if (notificationAction.actionId === 'OPEN_PRODUCT') {
          this.router.navigate(['tabs/cart']);
        }
      }
    );
  }

  async cancelScheduleLocalNotification() {
    const id = 1001; // The ID of the scheduled notification you want to cancel
    LocalNotifications.cancel({ notifications: [{ id }] });
  }

  async checkifPendingNotificationAndCancel() {
    const pendingNotifications = await LocalNotifications.getPending();

    if (pendingNotifications.notifications.length > 0) {
      // There is a pending notification.
      this.cancelScheduleLocalNotification();
    } else {
      // There are no pending notifications.
      console.log('There are no pending notifications.');
    }
  }

  async checkifNoPendingNotificationAndSchedule() {
    const pendingNotifications = await LocalNotifications.getPending();
    // this.scheduleLocalNotification();
    // alert('Nitification schediled');

    if (pendingNotifications.notifications.length === 0) {
      // There are no pending notifications.
      console.log('There are no pending notifications.');
      this.scheduleLocalNotification();
    } else {
      // There is a pending notification.
      console.log('There is a pending notification.');
    }
  }

  ngOnInit() {
    this.deviceOs = this.dataservice.global_OS;
    this.retrieveUserCart(this.dataservice.global_auth.token);
  }

  ionViewDidEnter() {
    this.cart = this.dataservice.global_cart;
    if (this.dataservice.global_auth?.id && !this.onlineCart) {
      this.retrieveUserCart(this.dataservice.global_auth.token);
    }
    this.calculateTotal();
    this.getQuickBuy();
  }

  ionViewDidLeave() {
    this.removeViewedIfInCart();
    // check if abandon cart and send notification if cart abandoned
    if (this.cart?.length > 0) {
      this.checkifNoPendingNotificationAndSchedule();
    } else {
      this.checkifPendingNotificationAndCancel();
    }
  }
}
