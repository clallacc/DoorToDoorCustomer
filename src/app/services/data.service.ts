import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  doortodoorURL: string = environment.doortodoorLiveURL;
  doortodoorPostURL: string = environment.doortodoorLivePostURL;
  customer_key: string = environment.customer_key_live;
  customer_secret: string = environment.customer_secret_live;
  app_name: string = environment.app_name_live;
  app_pw: string = environment.app_pw_live;
  JWT_AUTH_URL: string = environment.JWT_AUTH_URL_LIVE;
  firebase_api_key: string = environment.firebase_key;
  firebase_access_token: string = environment.firebase_token;

  // GLOBAL VARIABLES
  global_cart: any = [];
  global_shopping_list: any = [];
  global_recent_view: any = [];
  global_auth: any = [];
  global_OS: any = [];
  global_server: any = false;

  constructor() {}

  async doStoreServer(value: any) {
    await Preferences.set({
      key: 'd2d_site_server',
      value: value,
    });
  }

  async doGetServer() {
    await Preferences.get({
      key: 'd2d_site_server',
    });
  }

  doUserLogin(username: any, password: any) {
    let data = {
      username: username,
      password: password,
    };
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/jwt-auth/v1/token`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      data: data,
      withCredentials: true,
    };
    return CapacitorHttp.post(options);
  }

  validataJWTToken(token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/jwt-auth/v1/token/validate`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    return CapacitorHttp.post(options);
  }

  doGetJWTRefreshToken(token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/jwt-auth/v1/token/refresh`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        refresh_token: token,
      },
    };
    return CapacitorHttp.post(options);
  }

  doUserRegister(data: any) {
    const options = {
      url: `${this.doortodoorPostURL}users`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doGetPage(page: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/wp/v2/pages`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        // Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      params: {
        slug: page,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetShoplistPage(page: any, token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/wp/v2/pages`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: {
        slug: page,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetPageById(id: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/wp/v2/pages/${id}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
    };
    return CapacitorHttp.get(options);
  }

  doPrimeStatusCheck(email: any, token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/prime/status/`,
      // url: `/api/west/wp-json/prime/status/`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: {
        email: email,
      },
    };
    return CapacitorHttp.get(options);
  }

  doUpdateUserAddress(userId: any, data: any) {
    const options = {
      url: `${this.doortodoorURL}customers/${userId}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doProductGet(id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/${id}/?consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doRelatedProductGet(id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/${id}/?consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductsGet(per_page: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?per_page=${per_page}&page=${page}&stock_status=instock&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductBySKUGet(sku: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?sku=${sku}&per_page=20&page=1&stock_status=instock&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductsFilterGet(per_page: any, page: any, filter?: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?per_page=${per_page}&page=${page}&stock_status=instock${filter}&type=simple&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };

    return CapacitorHttp.get(options);
  }

  doProductsBundlesGet(per_page: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?per_page=${per_page}&page=${page}&stock_status=instock&type=woosb&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };

    return CapacitorHttp.get(options);
  }

  doProductsSearchGet(filter: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?stock_status=instock&page=${page}&per_page=20&search=${filter}&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductTagsGet(tag: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/tags/`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
        search: tag,
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductsByTagsGet(tag: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
        tag: tag,
        page: page,
        status: 'publish',
        per_page: '50',
      },
    };
    return CapacitorHttp.get(options);
  }

  doProductBundlesGet(per_page: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?per_page=${per_page}&page=${page}&status=publish&type=woosb&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetCategories() {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/categories/?parent=0&per_page=50&page=1&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetCategory(id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/categories/${id}?consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetSubCategory(id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/categories/?parent=${id}&per_page=50&page=1&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetProductsInCategory(id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}products/?category=${id}&per_page=50&page=1&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetCoupon(coupon: any, token?: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}coupons/?search=${coupon}&per_page=50&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetDefaultShippingMethod() {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}shipping/zones/2/methods/?consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doOrdersGet(token: any, id: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}orders/`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
        // Authorization: `Bearer ${token}`,
      },
      params: {
        customer: id,
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };

    return CapacitorHttp.get(options);
  }

  doShippingMethodGet() {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}shipping/zones/2/methods`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
    };

    return CapacitorHttp.get(options);
  }

  doPaymentGatewayGet() {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}payment_gateways`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
    };

    return CapacitorHttp.get(options);
  }

  doCCpaymentStoreCard(data: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/token/create`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doGetCCStoredCards(email: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/token/all`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      params: { email: email },
    };
    return CapacitorHttp.get(options);
  }

  doGetDealsPosts(categoryId: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/wp/v2/posts/`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      params: { categories: categoryId, status: 'publish' },
    };
    return CapacitorHttp.get(options);
  }

  doCustomerGet(id?: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorURL}customers/${id}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };

    return CapacitorHttp.get(options);
  }

  doRecipesGet(token: any, per_page: any, page: any) {
    const options: HttpOptions = {
      url: `${this.doortodoorPostURL}posts/?per_page=${per_page}&page=${page}&status=publish&consumer_key=${this.customer_key}&consumer_secret=${this.customer_secret}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };

    return CapacitorHttp.get(options);
  }

  doGetProcessingOrders() {
    const options = {
      url: `${this.doortodoorURL}orders`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      params: {
        per_page: '20',
        status: 'processing, pending',
      },
    };
    return CapacitorHttp.get(options);
  }

  doWriteOrderNote(order_number: any, note: any) {
    const options = {
      url: `${this.doortodoorURL}orders/${order_number}/notes`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: { note: note },
    };
    return CapacitorHttp.post(options);
  }

  doGetProductReview(id: any) {
    const options = {
      url: `${this.doortodoorURL}products/reviews/${id}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doCreateReview(data: any) {
    const options = {
      url: `${this.doortodoorURL}products/reviews`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doWriteOrderStatus(order_number: any, status: any) {
    const options = {
      url: `${this.doortodoorURL}orders/${order_number}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: { status: status },
    };
    return CapacitorHttp.post(options);
  }

  doPlaceOrder(data: any) {
    const options = {
      url: `${this.doortodoorURL}orders`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doUpdateOrder(id: any, data: any) {
    const options = {
      url: `${this.doortodoorURL}orders/${id}`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${this.app_name}:${this.app_pw}`)}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doPlaceOrderStoreCC(data: any, token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/token/create`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doAuthorizeCCPayment(data: any, token: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/app/payment/authorize`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  doGetScheduleData(token?: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/woo-delivery/v1/slots`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    return CapacitorHttp.get(options);
  }

  doGetShoplistData(token?: any) {
    const options = {
      url: `${this.JWT_AUTH_URL}wp-json/woo-delivery/v1/slots`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return CapacitorHttp.get(options);
  }

  async syncShoplistWeb(id: any, token: any) {
    // POST to AXIO ENDPOINT
    const form: FormData = new FormData();
    form.append('product_id', `${id}`);

    const headers = {
      'Content-Type': 'multipart/form-data; charset=UTF-8',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    return await axios.post(`${this.JWT_AUTH_URL}wp-json/wishlist/add`, form, {
      headers,
    });
  }

  doGetCartItems(token?: any) {
    const options: HttpOptions = {
      url: `${this.JWT_AUTH_URL}wp-json/wc/store/cart/items`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    return CapacitorHttp.get(options);
  }

  async doGetCartNonce(token?: any) {
    const options: HttpOptions = {
      url: `${this.JWT_AUTH_URL}wp-json/wc/store/cart`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: {
        consumer_key: this.customer_key,
        consumer_secret: this.customer_secret,
      },
    };
    return CapacitorHttp.get(options);
  }

  doSyncWithWebCart(id: any, qty: any, token: any) {
    console.log('product_id', id);
    const data = {
      id: `${id}`,
      quantity: `${qty}`,
    };
    const options = {
      url: `${this.JWT_AUTH_URL}/wp-json/wc/store/cart/add-item`,
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'X-WC-Store-API-Nonce': `d69973d455`,
      },
      data: data,
    };
    return CapacitorHttp.post(options);
  }

  // Local Storage. Calls
  async doStoreUserSettings(user_settings: any) {
    await Preferences.set({
      key: 'd2d_user_settings',
      value: user_settings,
    });
  }

  async doGetUserSettings() {
    return await Preferences.get({ key: 'd2d_user_settings' });
  }

  async doStoreFeaturedProductsCache(user_settings: any) {
    await Preferences.set({
      key: 'd2d_featured_products_cache',
      value: user_settings,
    });
  }

  async doGetFeaturedProductsCache() {
    return await Preferences.get({ key: 'd2d_featured_products_cache' });
  }

  async doStoreSaleProductsCache(user_settings: any) {
    await Preferences.set({
      key: 'd2d_sale_products_cache',
      value: user_settings,
    });
  }

  async doGetSaleProductsCache() {
    return await Preferences.get({ key: 'd2d_sale_products_cache' });
  }

  async doStoreBundleCache(user_settings: any) {
    await Preferences.set({
      key: 'd2d_bundles_cache',
      value: user_settings,
    });
  }

  async doGetBundleCache() {
    return await Preferences.get({ key: 'd2d_bundles_cache' });
  }

  async doLowPricedCache(user_settings: any) {
    await Preferences.set({
      key: 'd2d_low_priced_cache',
      value: user_settings,
    });
  }

  async doGetLowPricedCache() {
    return await Preferences.get({ key: 'd2d_low_priced_cache' });
  }

  async doStoreInCart(cartValue: any) {
    await Preferences.set({
      key: 'd2d_cart',
      value: cartValue,
    });
  }

  async doGetCart() {
    return await Preferences.get({ key: 'd2d_cart' });
  }

  async doRemoveCart() {
    await Preferences.remove({ key: 'd2d_cart' });
  }

  async doStoreSiteCart(cartValue: any) {
    await Preferences.set({
      key: 'd2d_site_cart',
      value: cartValue,
    });
  }

  async doGetSiteCart() {
    return await Preferences.get({ key: 'd2d_site_cart' });
  }

  async doSaveUser(userdata: any) {
    await Preferences.set({
      key: 'd2d_user',
      value: userdata,
    });
  }

  async doRemoveSaveUser() {
    await Preferences.remove({ key: 'd2d_user' });
  }

  async doGetuser() {
    return await Preferences.get({ key: 'd2d_user' });
  }

  async doSaveSearch(userdata: any) {
    await Preferences.set({
      key: 'd2d_search_log',
      value: userdata,
    });
  }

  async doGetSaveSearch() {
    return await Preferences.get({ key: 'd2d_search_log' });
  }

  async doDeleteSaveSearch() {
    return await Preferences.remove({ key: 'd2d_search_log' });
  }

  async doStoreShoppingList(data: any) {
    await Preferences.set({
      key: 'd2d_shopping_list',
      value: data,
    });
  }

  async doGetShoppingList() {
    return await Preferences.get({ key: 'd2d_shopping_list' });
  }

  async doRemoveShoppingList() {
    await Preferences.remove({ key: 'd2d_shopping_list' });
  }

  async doStoreRecentViewed(data: any) {
    await Preferences.set({
      key: 'd2d_recent_viewed',
      value: data,
    });
  }

  async doGetRecentViewed() {
    return await Preferences.get({ key: 'd2d_recent_viewed' });
  }
}
