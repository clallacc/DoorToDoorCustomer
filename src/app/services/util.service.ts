import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { DataService } from './data.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Router, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  private db = getFirestore(initializeApp(environment.firebaseConfig));
  constructor(
    private loadingCtl: LoadingController,
    private dataservice: DataService,
    private toastController: ToastController,
    private router: Router
  ) {}

  // LIVE
  imageURL(image?: any) {
    var newimg = '/assets/productfiller.png';
    let url;
    if (image && image !== undefined && image.src) {
      if (image?.src) {
        url = image.src.replace('https://', '');
      } else {
        url = image.replace('https://', '');
      }
      newimg = `https://i0.wp.com/${url}`;
    } else {
      newimg = '/assets/productfiller.png';
    }
    return newimg;
  }

  shareOnWhatsApp(producturl: any, title: any) {
    const message = title;
    const url = producturl; // Optional URL to share
    const encodedMessage = encodeURIComponent(message + ' ' + url);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    // Open the URL in a new window
    window.open(whatsappUrl, '_blank');
  }

  async getStoredPaymentGateway() {
    try {
      const users: any = await this.dataservice.doGetuser();
      const userData = JSON.parse(users.value);
      if (userData) {
        return userData.payment_gateways; // Return the payment gateways directly
      } else {
        return;
      }
    } catch (error) {
      console.error('Error fetching stored payment gateway:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async paymentMethods() {
    const payment_gateway = await this.getStoredPaymentGateway();
    await this.dataservice.doPaymentGatewayGet().then((payments: any) => {
      const paymentArray = payments.data;
      const default_payment = paymentArray.filter(
        (payment_filter: any) => payment_filter.enabled === true
      );
      if (JSON.stringify(default_payment) !== JSON.stringify(payment_gateway)) {
        this.dataservice.global_auth.payment_gateways = default_payment;
        if (!this.dataservice.global_auth.default_gateways) {
          this.dataservice.global_auth.default_gateways_id = 'cod';
        }
        this.dataservice.doSaveUser(
          JSON.stringify(this.dataservice.global_auth)
        );
      }
    });
  }

  async syncCustomerData() {
    await this.dataservice.doGetuser().then((res: any) => {
      if (res.value) {
        this.dataservice.global_auth = JSON.parse(res.value);
        if (this.dataservice.global_auth.token) {
          this.getTokenValidation(this.dataservice.global_auth.token);
          this.syncScheduleOrderData(this.dataservice.global_auth.token);
        }
      }
    });
    this.paymentMethods();
  }

  async RefreshCustomerData() {
    await this.dataservice.doGetuser().then((res: any) => {
      if (res.value) {
        this.dataservice.global_auth = JSON.parse(res.value);
        return this.dataservice.global_auth;
      }
    });
  }

  // store credit card token if exist
  async getCCtokens(customer_email: any, userJson: any) {
    await this.dataservice
      .doGetCCStoredCards(customer_email)
      .then((result: any) => {
        if (result.data.data.length > 0) {
          userJson.payment_methods = result.data.data;
          this.dataservice.doSaveUser(JSON.stringify(userJson));
          this.dataservice.global_auth = userJson;
        }
      })
      .catch((e) => console.log(e));
  }

  // Store user online shopping list
  async syncShoplistData() {
    // Initialize ProductsShopList, ensuring it's an array
    let ProductsShopList = this.dataservice.global_shopping_list || [];

    if (this.dataservice.global_auth.token) {
      const list = await this.dataservice.doGetShoplistPage(
        'shopping-list',
        this.dataservice.global_auth.token
      );
      const html = list.data[0].content.rendered;

      // Create a temporary element to parse the HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = html;

      // Remove suggestions
      const suggestionsElement = tempElement.querySelector(
        '.woosw-suggested-items'
      );
      if (suggestionsElement) {
        suggestionsElement.remove();
      }

      // Get all elements with the data-product_id attribute
      const elementsWithDataProductId =
        tempElement.querySelectorAll('[data-product_id]');
      const productIds = Array.from(elementsWithDataProductId)
        .map((element) => element.getAttribute('data-product_id'))
        .filter(Boolean);

      // Process each product ID
      for (const list_productId of productIds) {
        const synced_product = await this.dataservice.doProductGet(
          list_productId
        );

        // Check if the product already exists in ProductsShopList
        const productExists = ProductsShopList.some(
          (item: any) => item.id === synced_product.data.id
        );

        if (!productExists) {
          // Only proceed if the product does not exist
          ProductsShopList.push(synced_product.data);
        }
      }

      // Store the updated shopping list
      await this.dataservice.doStoreShoppingList(
        JSON.stringify(ProductsShopList)
      );
      this.dataservice.global_shopping_list = ProductsShopList;
    }
  }

  // store prime status
  async checkPrimeStatue(customer_email: any, userJson: any, token: any) {
    await this.dataservice
      .doPrimeStatusCheck(customer_email, token)
      .then((result: any) => {
        userJson.isprime = result.data.data;
        this.dataservice.doSaveUser(JSON.stringify(userJson));
        this.dataservice.global_auth = userJson;
      })
      .catch((e) => console.log(e));
    this.getCCtokens(customer_email, userJson);
  }

  // store customer detaills
  async setGlobalCustomerDetails(userdata: any, user_pass: any) {
    if (userdata) {
      if (userdata.id) {
        // set encripted user password
        userdata.refresh_access = this.encryptPassword(user_pass);
        this.dataservice.doCustomerGet(userdata.id).then((resp: any) => {
          // store user data
          userdata.customer = resp.data;
          ((userdata.default_payment = 'cod'),
          (userdata.default_payment_title =
            'Linx debit card payment on delivery.')),
            // check if user is prime and store data
            this.checkPrimeStatue(userdata.email, userdata, userdata.token);
        });
      }
      // store user data
      this.dataservice.global_auth = userdata;
      this.dataservice.doSaveUser(JSON.stringify(userdata));
    }
  }

  // Check it JWT Token is valid
  async getTokenValidation(TWTtoken: any) {
    if (this.dataservice.global_auth.token) {
      await this.dataservice.validataJWTToken(TWTtoken).then((token: any) => {
        if (!token.data.success) {
          // Refresh the token
          this.refreshJWTToken();
        } else {
          console.log('D2D JWT token is valid');
        }
      });
    }
  }

  // Refresh JWT token
  refreshJWTToken() {
    const user_pass = this.decryptPassword(
      this.dataservice.global_auth.refresh_access
    );
    this.dataservice
      .doUserLogin(this.dataservice.global_auth.email, user_pass)
      .then((data: any) => {
        this.dataservice.global_auth.token = data.data.token;
        this.dataservice.doSaveUser(
          JSON.stringify(this.dataservice.global_auth)
        );
      });

    // do token refresh
    // this.dataservice
    //   .doGetJWTRefreshToken(this.dataservice.global_auth.token)
    //   .then((token: any) => {
    //     console.log('tokemn', this.dataservice.global_auth.token);
    //     console.log('new refresh token', token);
    //   });
  }

  // Update cart items
  async updateCart(id: any, data: any, images?: any, quantity?: any) {
    if (!data.price || data.stock_status === 'outofstock') {
      this.presentAlertToast(
        'This product can not be added to cart!',
        'alert-outline',
        'light'
      );
    } else {
      var cartData: any = [];
      delete data['meta_data'];
      cartData.push(data);
      cartData.map((item: any) => {
        let sub_total = cartData[0].price * quantity;
        cartData = [{ ...item, quantity: quantity, sub_total: sub_total }];
      });

      if (this.dataservice.global_cart?.length > 0) {
        let filterCart = this.dataservice.global_cart.filter(
          (list: any) => list.id === id
        );
        if (filterCart.length == 0) {
          this.dataservice.global_cart.push(...cartData);
        }
      } else {
        this.dataservice.global_cart = cartData;
      }
      this.dataservice.doStoreInCart(
        JSON.stringify(this.dataservice.global_cart)
      );
      // Update cart on website
      this.dataservice
        .doGetCartNonce(this.dataservice.global_auth.token)
        .then((cart_nonce: any) => {
          console.log('nonce header', cart_nonce);
        });
      this.dataservice
        .doSyncWithWebCart(id, quantity, this.dataservice.global_auth.token)
        .then((cart_resp: any) => {
          console.log('cart_resp', cart_resp);
        });
      this.presentCartToast(
        'Added to cart.',
        data.name,
        'cart-outline',
        images
      );
    }
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    if (!data.price) {
      this.presentAlertToast(
        'This product can not be added to shopping list!',
        'alert-outline',
        'light'
      );
    } else {
      var productData: any = [];
      delete data['meta_data'];
      productData.push(data);
      productData.map((item: any) => {
        productData = [{ ...item, quantity: quantity }];
      });

      if (this.dataservice.global_shopping_list?.length > 0) {
        let filterCart = this.dataservice.global_shopping_list.filter(
          (list: any) => list.id === id
        );
        if (filterCart.length == 0) {
          this.dataservice.global_shopping_list.push(...productData);
        }
      } else {
        this.dataservice.global_shopping_list = productData;
      }
      this.dataservice.doStoreShoppingList(
        JSON.stringify(this.dataservice.global_shopping_list)
      );
      //Sync with online shopping list
      if (this.dataservice.global_auth.token) {
        this.dataservice
          .syncShoplistWeb(id, this.dataservice.global_auth.token)
          .then((resp: any) => {
            if (resp) {
              console.log('we have a response');
            }
          })
          .catch((e: any) => {
            console.log('error: ', e);
          });
      }

      this.presentAddShoplistToast(
        'Saved to shopping list.',
        data.name,
        'pricetags-outline',
        images
      );
    }
  }

  async presentCartToast(
    message: any,
    item: any,
    icon: any,
    productimage: any
  ) {
    let itemmessage = `${item} - ${message}`;
    const toast = await this.toastController.create({
      buttons: [
        {
          text: itemmessage,
          role: 'action',
          handler: () => {
            this.router.navigate(['/tabs/cart/']);
          },
        },
      ],
      duration: 6500,
      position: 'bottom',
      icon: icon,
      color: 'warning',
      cssClass: 'toast-custom-class',
    });
    // ADD IMAGE to Toast
    const image = document.createElement('img');
    image.setAttribute('src', this.imageURL(productimage));
    image.setAttribute('height', '35');
    image.setAttribute('width', '35');
    image.style.position = 'absolute';
    image.style.right = '8px';
    image.style.borderRadius = '10px';
    toast.shadowRoot?.querySelector('.toast-content')?.appendChild(image);
    toast.present();
  }

  async presentAddShoplistToast(
    message: any,
    item: any,
    icon: any,
    productimage: any
  ) {
    let itemmessage = `${item} - ${message}`;
    const toast = await this.toastController.create({
      buttons: [
        {
          text: itemmessage,
          role: 'action',
          handler: () => {
            this.router.navigate(['/tabs/shoplist/']);
          },
        },
      ],
      duration: 6500,
      position: 'bottom',
      icon: icon,
      color: 'warning',
      cssClass: 'toast-custom-class',
    });
    // ADD IMAGE to Toast
    const image = document.createElement('img');
    image.setAttribute('src', this.imageURL(productimage));
    image.setAttribute('height', '35');
    image.setAttribute('width', '35');
    image.style.position = 'absolute';
    image.style.right = '8px';
    image.style.borderRadius = '10px';
    toast.shadowRoot?.querySelector('.toast-content')?.appendChild(image);
    toast.present();
  }

  async loader(message: any) {
    const loading = await this.loadingCtl.create({
      message: message,
      spinner: 'dots',
      cssClass: 'dtd-loading',
      duration: 5000,
    });

    loading.present();
  }

  async loaderNoDuration(message: any) {
    const loading = await this.loadingCtl.create({
      message: message,
      spinner: 'dots',
      cssClass: 'dtd-loading',
    });

    loading.present();
  }

  async dismissLoading() {
    await this.loadingCtl.dismiss();
  }

  async presentAlertToast(message: any, icon: any, color?: any) {
    let toast_color;
    if (color) {
      toast_color = color;
    } else {
      toast_color = 'light';
    }
    const toast = await this.toastController.create({
      message: message,
      duration: 6500,
      position: 'bottom',
      icon: icon,
      color: toast_color,
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }

  async dismissLoader() {
    if (this.loadingCtl) {
      this.loadingCtl.dismiss();
    }
  }

  async scheduleLocalNotification(
    notification_id: any,
    message: any,
    delay_miliseconds: number,
    route: any,
    extra: any
  ) {
    const delay = 5 * 60 * delay_miliseconds; // 4 minutes in milliseconds
    // const delay = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notification_id,
          title: 'DoortoDoorTT',
          body: message,
          smallIcon: 'house',
          actionTypeId: 'OPEN_PRODUCT',
          schedule: { at: new Date(Date.now() + delay) },
          extra: extra ? extra : null,
        },
      ],
    });
    // Add a listener for notification click event
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notificationAction) => {
        if (notificationAction.actionId === 'OPEN_PRODUCT') {
          this.router.navigate([route]);
        }
      }
    );
  }

  async firestorePushNotification(data: any, route: any, id: any) {
    await LocalNotifications.schedule({
      notifications: [data],
    });
    // Add a listener for notification click event
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notificationAction) => {
        if (notificationAction.actionId === 'OPEN_FIREPUSH') {
          this.router.navigate([route, id]);
        }
      }
    );
  }

  async cancelLocalNotification(id: any) {
    await LocalNotifications.cancel(id);
  }

  async syncScheduleOrderData(token: any) {
    this.dataservice.doGetScheduleData(token).then((res: any) => {
      if (res) {
        this.dataservice.doStoreScheduleData(JSON.stringify(res.data));
      }
    });
  }

  async getFirestoreNotidications() {
    const collectionRef = collection(this.db, 'd2d-app-push-notifications');
    const snapshot = await getDocs(collectionRef);
    const notifications = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));
    // Sort notifications in descending order based on schedule.at
    const sortedNotifications = notifications.sort((a: any, b: any) => {
      const dateA = a.schedule?.at ? new Date(a.schedule.at) : new Date(0);
      const dateB = b.schedule?.at ? new Date(b.schedule.at) : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });
    this.dataservice.global_firestore_campaigns = notifications;
  }

  swipeToGoBack() {
    // Add event listeners for touchstart and touchend
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchend', handleTouchEnd, false);
    window.addEventListener('touchmove', handleTouchMove, false);

    let startX: number;
    let startY: number;
    let touchMoveX: number;
    const swipeThreshold = 100;

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function handleTouchMove(event: TouchEvent) {
      touchMoveX = event.touches[0].clientX;
      let goBackPrompt = startX + 180;
      let path = window.location.href;
      let parts = path.split('/');
      let historyPath = parts[parts.length - 1];
      if (touchMoveX > goBackPrompt && historyPath != 'home') {
        // animate back indecator
        const divElement = document.querySelector(
          '.back-btn-swiper'
        ) as HTMLElement;
        if (divElement) {
          divElement.style.transition = 'transform 0.3s ease-in-out';
        }
        function animateDiv() {
          if (divElement) {
            divElement.style.transform = `translateX(20vw)`;
          }
        }
        // Call the animateDiv function to trigger the animation
        animateDiv();
        // animate back indecator
      }
    }

    function handleTouchEnd(event: TouchEvent) {
      const touch = event.changedTouches[0];
      const distanceX = touchMoveX - startX;

      if (Math.abs(distanceX) > swipeThreshold) {
        if (touch) {
          // animate back indecator
          const divElement = document.querySelector(
            '.back-btn-swiper'
          ) as HTMLElement;
          if (divElement) {
            divElement.style.transition = 'transform 0.3s ease-in-out';
          }
          function animateDiv() {
            if (divElement) {
              divElement.style.transform = 'translateX(-100vw)';
            }
          }
          // Call the animateDiv function to trigger the animation
          animateDiv();
          // animate back indecator
        }
      }
      let goBackPos = startX + 200;
      if (touchMoveX > goBackPos) {
        let path = window.location.href;
        let parts = path.split('/');
        let historyPath = parts[parts.length - 1];
        if (historyPath != 'home') {
          window.history.back();
          // animate back indecator
          const divElement = document.querySelector(
            '.back-btn-swiper'
          ) as HTMLElement;
          if (divElement) {
            divElement.style.transition = 'transform 0.3s ease-in-out';
          }
          function animateDiv() {
            if (divElement) {
              divElement.style.transform = 'translateX(-100vw)';
            }
          }
          // Call the animateDiv function to trigger the animation
          animateDiv();
          // animate back indecator
        }
      }
    }
  }

  checkCouponUsage(data: { [key: number]: any }, value: any) {
    return Object.values(data).filter((item) => item === value).length;
  }

  valudateCoupon(
    coupon_code: any,
    coupon_data: any,
    sub_total: any,
    is_prime: any,
    customer_email?: any,
    coupon_array?: any,
    individual_use_coupon_set?: any,
    cart?: any
  ) {
    let notice = '';
    let valid = true;
    let discount_amount = '';
    let discount_type = '';
    let free_delivery = false;
    let free_delivery_cost = 0.0;

    // Filter coupons to exact match
    coupon_data = coupon_data.filter(
      (coupon_filter: any) => coupon_filter.code === coupon_code
    );

    // Handle apply coupon
    if (coupon_data && coupon_data.length === 1) {
      console.log('coupon_data', coupon_data);
      // set coupon free shipping option true/false
      if (is_prime || coupon_data[0]?.free_shipping) {
        free_delivery = true;
      }
      // check coupon schedule data
      const currentDate = new Date();
      const couponMetaData = coupon_data[0]?.meta_data;
      const foundMeta = couponMetaData?.find(
        (item: { key: string }) =>
          item.key === '_acfw_enable_date_range_schedule'
      );
      if (foundMeta?.value === 'yes') {
        const couponScheduleStart = couponMetaData?.find(
          (item: { key: string }) => item.key === '_acfw_schedule_start'
        );
        const couponScheduleEnd = couponMetaData?.find(
          (item: { key: string }) => item.key === '_acfw_schedule_end'
        );
        // check coupon schedule date satated
        const couponScheduleStartDate = new Date(couponScheduleStart.value);
        if (currentDate < couponScheduleStartDate) {
          const couponScheduleStartError = couponMetaData?.find(
            (item: { key: string }) =>
              item.key === '_acfw_schedule_start_error_msg'
          );
          if (couponScheduleStartError?.value) {
            notice = couponScheduleStartError.value;
          } else {
            notice = `Your coupon code will be active from ${couponScheduleStart.value}`;
          }
          valid = false;
        }
        const couponScheduleEndDate = new Date(couponScheduleEnd.value);
        if (currentDate > couponScheduleEndDate) {
          const couponScheduleEndError = couponMetaData.find(
            (item: { key: string }) =>
              item.key === '_acfw_schedule_expire_error_msg'
          );
          if (couponScheduleEndError?.value) {
            notice = couponScheduleEndError.value;
          } else {
            notice = `Your coupon code has expired`;
          }
          valid = false;
        }
      }
      // check usage count limit not crossed
      if (
        coupon_data[0]?.usage_limit &&
        this.checkCouponUsage(
          coupon_data[0]?.used_by,
          this.dataservice.global_auth.id
        ) > coupon_data[0]?.usage_limit
      ) {
        notice = `Usage limit ${coupon_data[0]?.usage_limit} was exceeded`;
        valid = false;
      }
      // check usage count limit not crossed
      if (
        coupon_data[0]?.usage_count >= coupon_data[0]?.usage_limit_per_user &&
        coupon_data?.length === 1 &&
        this.checkCouponUsage(
          coupon_data[0]?.used_by,
          this.dataservice.global_auth.id
        ) >= coupon_data[0]?.usage_limit_per_user &&
        coupon_data[0]?.usage_limit_per_user !== null
      ) {
        notice = `Coupon limit ${coupon_data[0]?.usage_limit_per_user} per user`;
        valid = false;
      }
      const subtotal = sub_total.replace('$', '');
      const rawSubtotal = subtotal.replace(',', '');
      if (
        parseFloat(coupon_data[0]?.minimum_amount) >= 0 ||
        parseFloat(coupon_data[0]?.maximum_amount) >= 0
      ) {
        // Calculate minimum spend
        if (
          parseFloat(coupon_data[0]?.minimum_amount) > 0 &&
          Number(rawSubtotal) < parseFloat(coupon_data[0]?.minimum_amount)
        ) {
          notice = `Minimum purchase $${coupon_data[0]?.minimum_amount}`;
          valid = false;
        }
        // Calculate maximum spend
        if (
          parseFloat(coupon_data[0]?.maximum_amount) > 0 &&
          Number(rawSubtotal) > parseFloat(coupon_data[0]?.maximum_amount)
        ) {
          notice = `Maximum purchase $${coupon_data[0]?.maximum_amount}`;
          valid = false;
        }
      }

      // check if coupon restricted to email
      if (coupon_data[0]?.email_restrictions.length > 0) {
        const email = coupon_data[0]?.email_restrictions.find(
          (email: string) => email === customer_email
        );
        if (!email) {
          notice = `Sorry, this coupon is not applicable.`;
          valid = false;
        }
      }

      // Set discount and discount type
      discount_amount = coupon_data[0]?.amount;
      discount_type = coupon_data[0]?.discount_type;
    } else {
      valid = false;
      notice = `Coupon "${coupon_code}" does not exist!`;
    }
    if (
      (coupon_data[0]?.individual_use && coupon_array?.length > 0) ||
      individual_use_coupon_set
    ) {
      valid = false;
      notice = `Coupon can only be used solely.`;
    }
    // check if individual use set
    if (coupon_data[0]?.individual_use) {
      individual_use_coupon_set = true;
    }

    // Check if products limit
    if (coupon_data[0].product_ids?.length > 0) {
      const validIds = coupon_data[0].product_ids;
      const cartProductIds = cart.map((product: any) => product.id);
      const exists = cartProductIds.some((id: any) => validIds.includes(id));
      if (!exists) {
        valid = false;
        notice = `Sorry, this coupon is not applicable to these products.`;
      }
    }

    // Check if products exclided
    if (coupon_data[0].excluded_product_ids.length > 0) {
      const validIds = coupon_data[0].product_ids;
      const cartProductIds = cart.map((product: any) => product.id);
      const exists = cartProductIds.some((id: any) => validIds.includes(id));
      if (exists) {
        valid = false;
        notice = `Sorry, this coupon is not applicable to these products.`;
      }
    }

    return {
      notice: notice,
      validity: valid,
      discount_amount: discount_amount,
      discount_type: discount_type,
      free_delivery: free_delivery,
      free_delivery_cost: free_delivery_cost,
    };
  }

  d2dLocations() {
    let locations = [
      {
        addresses: [
          {
            state: 'Arima',
            cities: [
              'Arima',
              'Calvary Hill',
              'Christina Gardens',
              'Gopaul Lands',
              'La Florissant',
              'Malabar',
              'O’Meara',
              'Sangre Grande',
              'Santa Rosa Heights',
              'The Crossings',
              'Torecilla Gardens',
              'Tumpna Road',
            ],
          },
          {
            state: 'Diego Martin',
            cities: [
              'Alyce Glen',
              'Bagatelle',
              'Belle Vue',
              'Blue Basin',
              'Blue Range',
              'Boissiere',
              'Diamond Vale',
              'Diego Martin',
              'Cameron',
              'Chaguaramas',
              'Cocorite',
              'Covigne',
              'Crystal Stream',
              'Glencoe',
              'Goodwood',
              'Four Roads',
              'Morne Coco',
              'Moka',
              'La Puerta',
              'Petit Valley',
              'Point Cumana',
              'Rich Plain',
              'St. Lucien',
            ],
          },
          {
            state: 'Port of Spain',
            cities: [
              'Belmont East',
              'Belmont North & West',
              'Belmont South',
              'East Dry River',
              'Maraval',
              'Northern Port of Spain',
              'Port of Spain',
              'San Juan–Laventille',
              "St. Ann's River South",
              "St. Ann's River Central",
              "St. Ann's River North",
              'St. James East',
              'St. James West',
              'Santa Cruz',
              'Southern Port of Spain',
              'Woodbrook',
            ],
          },
          {
            state: 'Tunapuna–Piarco',
            cities: [
              'Arouca',
              'Auzonville',
              'Blanchisseus',
              'Bon Air',
              'Cane Farm',
              'Carapo',
              'Caura',
              'Cleaver',
              'Curepe',
              "D'Abadie",
              'Five Rivers',
              'Kelly Village',
              'La Florissante',
              'La Horquetta',
              'Lopinot',
              'Maloney',
              'Mausica',
              'Maracas',
              'Macoya',
              'Pasea',
              'Paradise',
              'Piarco',
              'St Augustine South',
              'St. Helena',
              'St. Joseph',
              'Santa Margarita',
              'Santa Rosa',
              'Tacarigua',
              'Tunapuna',
              'Tunapuna–Piarco',
              'Trincity',
              'Valsayn',
              'Wallerfield',
              'Warrenville',
            ],
          },
        ],
      },
    ];
    return locations;
  }

  encryptPassword(password: any) {
    const array = [
      'a',
      'A',
      'b',
      'B',
      'c',
      'C',
      'd',
      'D',
      'e',
      'E',
      'f',
      'F',
      'g',
      'G',
      'h',
      'h',
      'i',
      'I',
      'j',
      'J',
      'k',
      'K',
      'l',
      'L',
      'm',
      'M',
      'n',
      'N',
      'o',
      'O',
      'p',
      'P',
      'q',
      'Q',
      'r',
      'R',
      's',
      'S',
      't',
      'T',
      'u',
      'U',
      'v',
      'V',
      'w',
      'W',
      'x',
      'X',
      'y',
      'Y',
      'z',
      'Z',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ];

    const stringToReplace = password;
    let replacedString = '';

    for (let i = 0; i < stringToReplace.length; i++) {
      const char = stringToReplace[i];
      const index = array.indexOf(char);

      if (index !== -1) {
        const targetIndex = (index + 20) % array.length;
        const targetChar = array[targetIndex];
        replacedString += targetChar;
      } else {
        replacedString += char;
      }
    }
    return replacedString;
  }

  decryptPassword(password: any) {
    const array = [
      'a',
      'A',
      'b',
      'B',
      'c',
      'C',
      'd',
      'D',
      'e',
      'E',
      'f',
      'F',
      'g',
      'G',
      'h',
      'h',
      'i',
      'I',
      'j',
      'J',
      'k',
      'K',
      'l',
      'L',
      'm',
      'M',
      'n',
      'N',
      'o',
      'O',
      'p',
      'P',
      'q',
      'Q',
      'r',
      'R',
      's',
      'S',
      't',
      'T',
      'u',
      'U',
      'v',
      'V',
      'w',
      'W',
      'x',
      'X',
      'y',
      'Y',
      'z',
      'Z',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ];

    const replacedString = password;
    let originalString = '';

    for (let i = 0; i < replacedString.length; i++) {
      const char = replacedString[i];
      const index = array.indexOf(char);

      if (index !== -1) {
        const targetIndex = (index - 20 + array.length) % array.length;
        const targetChar = array[targetIndex];
        originalString += targetChar;
      } else {
        originalString += char;
      }
    }
  }
}
