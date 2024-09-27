import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import {
  AlertController,
  IonicModule,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';
import { UserdetailsPage } from '../userdetails/userdetails.page';
import { LoginregisterPage } from '../loginregister/loginregister.page';
import { FormsModule } from '@angular/forms';
import { AddpaymentPage } from '../addpayment/addpayment.page';
import { LocalNotifications } from '@capacitor/local-notifications';
import { OrdersPage } from '../orders/orders.page';

@Component({
  selector: 'app-checkout',
  templateUrl: 'checkout.page.html',
  styleUrls: ['checkout.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [LoginregisterPage],
})
export class CheckoutPage {
  cart: any;
  subtotal: any = 0;
  subtotalitems: any = 0;
  storeTotal: any = 0;
  total: any = 0;
  revised_total: any = 0;
  default_delivery_fee: any;
  delivery: any = 50.0;
  scheduling: any = 35.0;
  totalitems: any = 0;
  default_payment: any;
  paymentId: any;
  paymentTitle: string = '';
  paymentMethodTitle: string = '';
  paymentDescription: string = '';
  customer: any;
  coupon_code: any;
  coupon_discount: any;
  coupon_type: any;
  coupon_free_delivery = false;
  coupon_notice: any;
  shipping_rates: any;
  shippingType: any;
  shippingTypeTitle: any;
  lineitems: any = [];
  deviceOs: any;
  customer_isloggedin = false;
  customer_adderss_set = false;
  customerNote: string = '';
  noteFieldActive = false;
  removedCheckoutItems: any = [];
  card_number: any;
  expiry: any;
  cvv: any;
  isprime: any = false;
  isDateEnabled: any;
  schedule_data: any;
  schedule_selected_date: any = '';
  schedule_selected_time: any = '';
  schedule_times: any;
  schedule_times_active: any = true;
  clearScheduleActive = false;
  stored_payment_methods: any;
  cc_token: any;
  orderDisabled = true;
  checkoutState = false;
  show_order_complete_notice = false;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private location: Location,
    private router: Router
  ) {}

  goBack() {
    this.location.back();
  }

  setupChechout() {
    this.cart = this.dataservice.global_cart;
    this.customer = this.dataservice.global_auth;
    const prime_sku = this.cart.filter(
      (cart_items: any) => cart_items.sku === 'PRIME001'
    );
    if (prime_sku?.length > 0) {
      this.isprime = true;
    }
    this.setupCartItems();
    // Setup schedule order data
    if (!this.customer || this.customer.length === 0) {
      this.customer_isloggedin = false;
    } else {
      // Tomorrow date
      let today = new Date();
      let tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      let formatted_date = tomorrow.toISOString().split('T')[0];
      this.dateSelected(formatted_date);
      this.formatCartItems();
      this.customer_isloggedin = true;
    }
    if (this.coupon_code) {
      this.checkCoupon(this.coupon_code);
    }
    if (this.dataservice.global_auth?.default_gateways_id) {
      this.selectPaymentSection(
        this.dataservice.global_auth?.default_gateways_id
      );
    }
  }

  calculateItemTotal(quantity: any, price: any) {
    var itemTotal = Number(quantity * price);
    const formattedCurrency = itemTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formattedCurrency;
  }

  createTimeRanges(
    startTime: number,
    endTime: number,
    lapseTime: number,
    timeformat: number
  ): string[] {
    const ranges: string[] = [];
    let currentTime = startTime;

    while (currentTime + lapseTime <= endTime) {
      const startTimeString = this.convertTime(currentTime, timeformat);
      const endTimeString = this.convertTime(
        currentTime + lapseTime,
        timeformat
      );
      const range = `${startTimeString} - ${endTimeString}`;
      ranges.push(range);
      currentTime += lapseTime;
    }
    return ranges;
  }

  convertTime(minutes: number, timeformat: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= timeformat ? 'PM' : 'AM';
    const convertedHours = hours > timeformat ? hours - timeformat : hours;
    const timeString = `${convertedHours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')} ${period}`;
    return timeString;
  }

  convertTimeTo24HourFormat(time12h: string): string {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');
    hours = hours === '12' ? '00' : hours;
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours}:${minutes}`;
  }

  convertToRegularTimeFormat(time: string): string {
    const [hours, minutes] = time.split(':');
    let convertedHours = parseInt(hours, 10) % 12 || 12;
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = convertedHours.toString().padStart(2, '0');

    return `${formattedHours}:${minutes} ${period}`;
  }

  removePMAM(times: any) {
    let newtime = times.split(' - ');
    const [split_start_hours, split_start_minutes] =
      this.convertTimeTo24HourFormat(newtime[0]).split(':');
    const [split_end_hours, split_end_minutes] = this.convertTimeTo24HourFormat(
      newtime[1]
    ).split(':');
    const start_hours = split_start_hours.replace(/\s?[AP]M/g, '');
    const start_minutes = split_start_minutes.replace(/\s?[AP]M/g, '');
    const end_hours = split_end_hours.replace(/\s?[AP]M/g, '');
    const end_minutes = split_end_minutes.replace(/\s?[AP]M/g, '');
    const starttime = `${start_hours}:${start_minutes}`;
    const endtime = `${end_hours}:${end_minutes}`;
    return `${starttime} - ${endtime}`;
  }

  addPMAM(times: any) {
    let newtime = times.split(' - ');
    const [start_hours, start_minutes] = this.convertTimeTo24HourFormat(
      newtime[0]
    ).split(':');
    const [end_hours, end_minutes] = this.convertTimeTo24HourFormat(
      newtime[1]
    ).split(':');
    const starttime = `${start_hours}:${start_minutes}`;
    const endtime = `${end_hours}:${end_minutes}`;
    return `${starttime} - ${endtime}`;
  }

  getFormattedDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  removePastTimeRanges(timeRanges: string[]): string[] {
    const currentDate = this.getFormattedDate();
    if (currentDate === this.schedule_selected_date) {
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();

      return timeRanges.filter((range) => {
        const [startTime] = range.split(' - ');
        const [startHours, startMinutes] = startTime
          .split(' ')[0]
          .split(':')
          .map(Number);
        const isPM = startTime.includes('PM') && startHours !== 12;
        const isAM = startTime.includes('AM') && startHours === 12;

        const startTimeInMinutes =
          (isPM ? startHours + 12 : isAM ? 0 : startHours) * 60 + startMinutes;

        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        return startTimeInMinutes > currentTimeInMinutes;
      });
    } else {
      return timeRanges;
    }
  }

  async dateSelected(ev: any) {
    // Disavle previous days in datetime.
    this.setupScheduleDateAndTime();
    let date: any;
    if (!ev.detail?.value) {
      date = new Date(ev);
    } else {
      date = new Date(ev.detail.value);
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (this.schedule_times) {
      this.schedule_times.forEach((times: any) => {
        let timeObj = this.removePMAM(times);
        this.valudateDate(formattedDate, timeObj);
      });
    }

    // handle schedule time refresh
    this.schedule_times = this.removePastTimeRanges(this.schedule_times);
    if (!this.schedule_times || this.schedule_times?.length === 0) {
      this.schedule_times_active = true;
    } else {
      this.schedule_times_active = false;
    }
    this.displayClearSceduleBtn();
  }

  displayClearSceduleBtn() {
    if (this.schedule_selected_date && this.schedule_selected_time) {
      this.clearScheduleActive = true;
    } else {
      this.clearScheduleActive = false;
    }
  }

  setupScheduling() {
    if (!this.isprime && this.schedule_times_active) {
      this.scheduling = 35.0;
    } else {
      this.scheduling = 0.0;
    }
  }

  timeSelection(ev: any) {
    this.schedule_selected_time = ev.detail?.value;
    if (this.schedule_selected_time) {
      this.schedule_times_active = true;
    } else {
      this.schedule_times_active = false;
    }
    this.setupScheduling();
    this.calculateTotal();
    this.displayClearSceduleBtn();
  }

  formatCurrency(currency: any) {
    const currencyString = String(currency);
    const [dollar, cents] = currencyString.split('.');
    if (!cents) {
      return `${dollar}.00`;
    } else {
      if (cents.length === 1) {
        return `${dollar}.${cents}0`;
      } else {
        return `${dollar}.${cents}`;
      }
    }
  }

  async valudateDate(date_range: any, time_range: any) {
    let new_date_list: any = [];
    this.schedule_selected_date = date_range;
    await this.dataservice.doGetProcessingOrders().then((res: any) => {
      if (res) {
        const orders = res.data;
        for (let completed_orders of orders) {
          if (completed_orders) {
            completed_orders.meta_data.forEach((meta_data: any) => {
              if (meta_data.value === date_range) {
                const metaData = completed_orders?.meta_data.filter(
                  (order: any) => order.value === time_range
                );
                if (metaData[0]) {
                  new_date_list.push(metaData[0]);
                }
              }
            });
          }
        }
        const [split_start_time, split_end_time] = time_range.split(' - ');
        const formatted_time =
          this.convertToRegularTimeFormat(split_start_time) +
          ' - ' +
          this.convertToRegularTimeFormat(split_end_time);
        if (
          new_date_list.length >=
          this.schedule_data.schedule_times.max_order_per_slot
        ) {
          this.schedule_times = this.schedule_times.filter(
            (times: any) => times !== formatted_time
          );
        }
      }
    });
  }

  async setupScheduleDateAndTime() {
    this.dataservice.doGetScheduleData(this.customer.token).then((res: any) => {
      if (res) {
        this.setupScheduleOffDays(res.data);
        this.schedule_data = res.data[0];
        this.schedule_times = Object.values(
          this.schedule_data?.delivery_times
        ).filter((value) => value !== '');
      }
    });
  }

  resetSchedule() {
    this.schedule_selected_time = '';
    this.clearScheduleActive = false;
  }

  setupScheduleOffDays(offdays: any) {
    this.isDateEnabled = (date: string) => {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().substr(0, 10);
      const disabledDates = offdays[0].off_days;

      return date >= formattedCurrentDate && !disabledDates.includes(date);
    };
  }

  setupCartItems() {
    // Get Shipping methods
    this.dataservice.doShippingMethodGet().then((data: any) => {
      this.shipping_rates = data.data;
      const shipping_data = data.data[0];
      this.shippingType = shipping_data.method_id;
      this.shippingTypeTitle = shipping_data.method_title;
      this.default_delivery_fee = shipping_data.settings.cost.value;
      this.delivery = this.default_delivery_fee;
      this.setupScheduling();
      this.calculateSubTotal();
      this.calculateTotal();
    });

    // set cart items for post
    var cartItems: any = [];
    if (this.cart) {
      this.cart.forEach((item: any) => {
        cartItems.push({
          product_id: item.id,
          quantity: item.quantity,
        });
      });
      this.lineitems = cartItems;
    }
  }

  calculateSubTotal() {
    this.subtotal = 0;
    this.totalitems = 0;

    if (this.cart) {
      for (let cartItems of this.cart) {
        this.totalitems += Number(cartItems.quantity);
        this.subtotal += Number(cartItems.sub_total);
      }
      this.subtotal = this.subtotal.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }
  }

  calculateTotal(coupon?: any, coupon_type?: any) {
    this.total = 0;
    this.storeTotal = 0;
    if (this.cart) {
      for (let cartItems of this.cart) {
        this.storeTotal += Number(cartItems.sub_total);
      }
      if (coupon) {
        if (coupon_type == 'percent') {
          if (coupon > 0 && coupon <= 100) {
            this.storeTotal =
              this.storeTotal - this.storeTotal * (coupon / 100);
          }
        } else {
          this.storeTotal = Number(this.storeTotal - coupon);
        }
      }
      if (this.isprime) {
        this.scheduling = 0.0;
        this.delivery = 0.0;
      } else {
        this.storeTotal =
          this.storeTotal + Number(this.scheduling) + Number(this.delivery);
      }

      this.total = this.storeTotal.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }
  }

  cancelCoupon() {
    this.coupon_code = '';
    this.checkCoupon(this.coupon_code);
  }

  async checkCoupon(coupon: any) {
    this.coupon_notice = '';
    this.coupon_code = '';
    this.coupon_discount = '';
    this.coupon_type = '';
    await this.dataservice
      .doGetCoupon(coupon, this.dataservice.global_auth.token)
      .then((data: any) => {
        if (data.data) {
          const coupon_data = data.data;
          let woo_coupon = coupon_data.filter(
            (code: any) => code.code === coupon && code.usage_count === 0
          );
          // set coupon free shipping option true/false
          if (!this.isprime) {
            if (coupon === coupon_data[0]?.code) {
              this.coupon_free_delivery = coupon_data[0]?.free_shipping
                ? coupon_data[0]?.free_shipping
                : false;
              if (this.coupon_free_delivery) {
                this.delivery = 0.0;
              }
            } else {
              this.delivery = this.default_delivery_fee;
            }
          }

          // check usege count limit
          if (
            coupon_data[0]?.usage_count >= coupon_data[0]?.usage_limit_per_user
          ) {
            this.coupon_notice = `Coupon limit ${coupon_data[0]?.usage_limit_per_user} per user`;
            return;
          }
          const subtotal = this.subtotal.replace('$', '');
          const rawSubtotal = subtotal.replace(',', '');
          if (
            coupon_data[0]?.minimum_amount !== '0.00' ||
            coupon_data[0]?.maximum_amount !== '0.00'
          ) {
            // Calculate minimum spend
            if (Number(rawSubtotal) >= coupon_data[0]?.minimum_amount) {
              // Calculate coupon discount
              this.calculateTotal(
                woo_coupon[0]?.amount,
                woo_coupon[0]?.discount_type
              );
              if (woo_coupon[0]?.code) {
                this.coupon_code = woo_coupon[0]?.code;
                this.coupon_discount = woo_coupon[0]?.amount;
                this.coupon_type = woo_coupon[0]?.discount_type;
              }
            } else {
              if (coupon == coupon_data[0]?.code && coupon_data?.length === 1) {
                this.coupon_notice = `Minimum purchase $${coupon_data[0]?.minimum_amount}`;
                return;
              }
            }
            // calculate maximum spend
            if (coupon_data[0]?.maximum_amount <= Number(rawSubtotal)) {
              // Calculate coupon discount
              this.calculateTotal(
                woo_coupon[0]?.amount,
                woo_coupon[0]?.discount_type
              );
              if (woo_coupon[0]?.code) {
                this.coupon_code = woo_coupon[0]?.code;
                this.coupon_discount = woo_coupon[0]?.amount;
                this.coupon_type = woo_coupon[0]?.discount_type;
              }
            } else {
              if (coupon == coupon_data[0]?.code && coupon_data?.length === 1) {
                this.coupon_notice = `Maximum purchase $${coupon_data[0]?.maximum_amount}`;
                return;
              }
            }
          } else {
            this.calculateTotal(woo_coupon[0]?.amount);
            if (woo_coupon[0]?.code) {
              this.coupon_code = woo_coupon[0]?.code;
              this.coupon_discount = woo_coupon[0]?.amount;
              this.coupon_type = woo_coupon[0]?.discount_type;
            }
          }
        }
      });
  }

  formatProductName(name: any, quantity: any) {
    return `${name} - x${quantity}`;
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
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
    this.customer.payment_methods.forEach((method: any) => {
      if (method.default_card === '1') {
        method.default_card = '0';
      }
    });

    this.customer.payment_methods[index].default_card = '1';
    this.customer.default_payment = 'ggfac';
    this.customer.default_payment_title = 'Pay Online VISA or MASTERCARD';
    this.dataservice.doSaveUser(JSON.stringify(this.customer));
  }

  formatCartItems() {
    var cartItems: any = [];
    this.cart.forEach((item: any) => {
      cartItems.push({
        product_id: item.id,
        quantity: item.quantity,
      });
    });
    this.lineitems = cartItems;
  }

  validateUserLoginShipping() {
    this.util.syncCustomerData();
    this.customer = this.dataservice.global_auth;
    if (
      this.customer?.customer &&
      Object.keys(this.customer.customer).length > 0
    ) {
      this.customer_isloggedin = true;
      if (this.customer.customer.billing.address_1 !== '') {
        this.customer_adderss_set = true;
      } else {
        this.customer_adderss_set = false;
      }
    } else {
      this.customer_isloggedin = false;
      this.customer_adderss_set = false;
    }
  }

  encodeOrderOrderIdToken(token: any, fname: any, lname: any) {
    const cc_tocan = token.slice(0, 6);
    const first_name = fname.slice(0, 1);
    const last_name = lname.slice(0, 1);

    return `${cc_tocan}${first_name}${last_name}`;
  }

  async addCCPaymentMethod(value: boolean) {
    const modal = await this.modalCtrl.create({
      component: AddpaymentPage,
      componentProps: {
        showStoreCards: value,
      },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
    });
    modal.present();

    modal.onDidDismiss().then(() => {
      this.customer = this.dataservice.global_auth;
      this.util.getCCtokens(this.customer.email, this.customer);
    });
  }

  async purchasePrime() {
    await this.dataservice.doProductBySKUGet('PRIME001').then((prod: any) => {
      if (prod.data) {
        this.util.updateCart(
          prod.data[0].id,
          prod.data[0],
          prod.data[0].images[0],
          1
        );
        this.isprime = true;
        this.setupChechout();
      }
    });
  }

  getPaymentMethods(paymentFilter?: any) {
    const default_payments = this.dataservice.global_auth.payment_gateways;
    if (default_payments?.length > 0) {
      if (paymentFilter) {
        this.default_payment = default_payments.filter(
          (method: any) => method.id === paymentFilter
        );
      } else {
        this.default_payment = default_payments.filter(
          (method: any) =>
            method.id === this.dataservice.global_auth.default_gateways_id
        );
      }
      this.paymentId = this.default_payment[0].id;
      this.paymentTitle = this.default_payment[0].title;
      this.paymentDescription = this.default_payment[0].description;
      this.paymentMethodTitle = this.default_payment[0].method_title;
    }
  }

  selectPaymentSection(payment: any) {
    if (payment) {
      this.getPaymentMethods(payment);
      if (payment === 'ggfac' && !this.customer?.payment_methods) {
        this.orderDisabled = true;
      } else {
        this.orderDisabled = false;
      }
    }
  }

  paymentSegmentChanged(ev: any) {
    this.selectPaymentSection(ev.detail.value);
  }

  async checkoutReview(status: boolean) {
    this.validateCheckoutItems();
    if (!this.customer_adderss_set) {
      this.show_order_complete_notice = false;
      this.updateAddress();
    } else {
      this.checkoutState = status;
    }
  }

  continueShopping() {
    this.show_order_complete_notice = false;
    this.modalCtrl.dismiss();
    this.router.navigate(['/tabs/home/']);
  }

  async cancelNoteAlert() {
    const alert = await this.alertController.create({
      header: 'Notice',
      message: 'Would you like to remove your order note.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.noteFieldActive = false;
            this.customerNote = '';
          },
        },
      ],
    });

    await alert.present();
  }

  addCustomerNote(ev: any) {
    this.customerNote = ev.detail.value;
  }

  showNoteField() {
    if (!this.noteFieldActive) {
      this.noteFieldActive = true;
    } else {
      if (this.customerNote) {
        this.cancelNoteAlert();
      } else {
        this.noteFieldActive = false;
        this.customerNote = '';
      }
    }
  }

  async validateCheckoutItems() {
    this.removedCheckoutItems = [];
    this.revised_total = 0;
    const productPromises = this.cart.map(async (item: any) => {
      const products = await this.dataservice.doProductGet(item.id);
      if (
        products.data.stock_status === 'outofstock' ||
        products.data.price === '0.00'
      ) {
        // Check if the item is already in removedCheckoutItems
        const exists = this.removedCheckoutItems.some(
          (removedItem: any) => removedItem.id === products.data.id
        );
        // Push only if it doesn't already exist
        if (!exists) {
          products.data.sub_total = item.sub_total;
          this.removedCheckoutItems.push(products.data);
        }
      }
    });

    // Wait for all product promises to resolve
    await Promise.all(productPromises);

    // Now that all products have been checked, remove items from lineitems
    if (this.removedCheckoutItems.length > 0) {
      this.lineitems = this.lineitems.filter((lineItem: any) => {
        // Check if the lineItem exists in removedCheckoutItems
        const isRemoved = this.removedCheckoutItems.some(
          (removedItem: any) => removedItem.id === lineItem.product_id
        );
        // Keep the lineItem only if it is not removed
        return !isRemoved;
      });

      // Calculate the new subtotal from removed items
      if (this.removedCheckoutItems.length > 0) {
        let new_subtotal = this.removedCheckoutItems.reduce(
          (acc: any, removedItem: any) => {
            return acc + removedItem.sub_total; // Accumulate the sub_total
          },
          0
        );
        let totalValue = parseFloat(this.total.replace(/[$,]/g, '')); // Convert to number
        let updatedTotalValue = totalValue - new_subtotal;
        this.revised_total = `$${updatedTotalValue.toFixed(2)}`;
      }
    }
  }

  async checkout() {
    if (!this.customer_isloggedin) {
      this.loginRegister();
    } else if (!this.customer_adderss_set) {
      this.updateAddress();
    } else {
      this.util.loader('Checkout in progress...');
      // Set Shipping method title to free delivery if user is prime
      if (this.isprime) {
        this.shippingTypeTitle = 'Free Delivery';
      }
      // Perform  the checkout action here
      let checkout: any = {
        customer_id: `${this.dataservice.global_auth.id}`,
        payment_method: this.paymentId,
        payment_method_title: this.paymentMethodTitle,
        set_paid: false,
        billing: this.customer.customer.billing,
        line_items: this.lineitems,
        shipping_lines: [
          {
            method_id: this.shippingType,
            method_title: this.shippingTypeTitle,
            total: this.formatCurrency(this.delivery),
          },
        ],
        meta_data: [
          {
            key: 'prime_order',
            value: this.isprime,
          },
          {
            key: 'order_source',
            value: 'd2d_app_v1',
          },
        ],
      };
      if (!this.dataservice.global_auth.customer.shipping?.address_1) {
        checkout = {
          ...checkout,
          shipping: this.customer.customer.billing,
        };
      } else {
        checkout = {
          ...checkout,
          shipping: this.customer.customer.shipping,
        };
      }
      if (this.coupon_code) {
        checkout = { ...checkout, coupon_lines: [{ code: this.coupon_code }] };
      }
      if (this.customerNote) {
        checkout = {
          ...checkout,
          customer_note: this.customerNote,
        };
      }
      if (
        this.schedule_selected_date &&
        this.schedule_selected_time &&
        this.schedule_selected_time !== null
      ) {
        checkout = {
          ...checkout,
          meta_data: [
            ...checkout.meta_data,
            {
              key: 'delivery_type',
              value: 'delivery',
            },
            {
              key: 'delivery_date',
              value: this.schedule_selected_date,
            },
            {
              key: 'delivery_time',
              value: this.schedule_selected_time,
            },
          ],
        };
      }
      if (this.paymentId === 'ggfac') {
        const payment_token = this.customer.payment_methods.filter(
          (token_data: any) => token_data.default_card === '1'
        );
        this.cc_token = payment_token[0].token;
        checkout = {
          ...checkout,
          payment_details: {
            token: this.cc_token,
          },
          status: 'pending',
        };
      }
      if (this.paymentId === 'cod') {
        checkout = {
          ...checkout,
          status: 'processing',
        };
      }
      await this.dataservice
        .doPlaceOrder(checkout)
        .then((resp: any) => {
          if (resp.data) {
            // Add order note
            if (this.customerNote !== '') {
              this.dataservice.doWriteOrderNote(
                resp.data.number,
                this.customerNote
              );
            }
            // Authenticate credit card
            if (this.paymentId === 'ggfac') {
              let payment_data = {
                total: resp.data.total,
                order_id: `D2DWB${resp.data.id}`,
                token: this.cc_token,
                first_name: resp.data.billing.first_name,
                last_name: resp.data.billing.last_name,
                email: resp.data.billing.email,
                phone: resp.data.billing.phone,
              };
              this.dataservice
                .doAuthorizeCCPayment(payment_data, this.customer.token)
                .then((cc_resp: any) => {
                  console.log('cc_resp', cc_resp);
                  if (cc_resp.success) {
                    this.util.presentAlertToast(
                      `${cc_resp.data.mesage}. Your order is now being processed.`,
                      'card'
                    );
                  } else {
                    this.util.presentAlertToast(
                      `${cc_resp.data.mesage}.. A Door to Door rep will contact you shortly.`,
                      'card'
                    );
                  }
                });
            }
            console.log('order completed: ', resp.data);
            this.orderCompleteNotice();
            const placed_order = resp.data;
            this.dataservice.global_cart = null;
            this.cart = this.dataservice.global_cart;
            this.dataservice.doRemoveCart();
            // Send order Notification after order placed
            this.checkifPendingNotification();
            this.util.scheduleLocalNotification(
              1002,
              `Your order ${placed_order.number} has been placed.`,
              1000,
              '/tabs/account'
            );
            this.util.dismissLoader();
            this.util.presentAlertToast(
              `Your order #${resp.data.number} was made successfully. Please look out for a confirmation email.`,
              'mail'
            );
          }
        })
        .catch((e: any) => {
          console.error('Error placing order', e);
          this.util.presentAlertToast(
            `Something went wrong: ${e}.`,
            'information'
          );
        });
    }
  }

  orderCompleteNotice() {
    this.show_order_complete_notice = true;
  }

  async showOrders() {
    this.checkoutState = false;
    const modal = await this.modalCtrl.create({
      component: OrdersPage,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();
    this.show_order_complete_notice = false;
  }

  async updateAddress() {
    const modal = await this.modalCtrl.create({
      component: UserdetailsPage,
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
    });
    modal.present();
    this.validateUserLoginShipping();
    this.setupChechout();

    modal.onDidDismiss().then(() => {
      this.customer = this.dataservice.global_auth;
    });
  }

  async loginRegister() {
    const modal = await this.modalCtrl.create({
      component: LoginregisterPage,
      componentProps: {
        page: 'signin',
      },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();

    modal.onDidDismiss().then(() => {
      this.dataservice.global_auth;
      this.validateUserLoginShipping();
      this.setupChechout();
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: `Your order was made successfully. Please look out for a confirmation email.`,
      duration: 3500,
      position: 'bottom',
      icon: 'email',
    });
    toast.present();
  }

  async cancelScheduleLocalNotification() {
    const id = 1001; // The ID of the scheduled notification you want to cancel
    LocalNotifications.cancel({ notifications: [{ id }] });
  }

  async checkifPendingNotification() {
    const pendingNotifications = await LocalNotifications.getPending();

    if (pendingNotifications.notifications.length > 0) {
      // There is a pending notification.
      this.cancelScheduleLocalNotification();
    } else {
      // There are no pending notifications.
      console.log('There are no pending notifications.');
    }
  }

  ionViewDidEnter() {
    this.validateUserLoginShipping();
    this.setupChechout();
    this.getPaymentMethods();
  }

  ngOnInit() {
    this.deviceOs = this.dataservice.global_OS;
    this.isprime = this.dataservice.global_auth?.isprime;
  }
}
