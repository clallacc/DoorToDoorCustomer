import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  IonicModule,
  ModalController,
  IonicSlides,
} from '@ionic/angular';
import { DataService } from '../services/data.service';
import { Router, RouterModule } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { BcscannerPage } from '../bcscanner/bcscanner.page';
import { Device } from '@capacitor/device';
import { UtilService } from '../services/util.service';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { NewdealPage } from '../newdeal/newdeal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  searchActive = false;
  onsaleProducts: any;
  bundlesProducts: any;
  featuredProducts: any;
  lowPricedProducts: any;
  recentViewedProducts: any;
  productsSearch: any;
  searchTerm: any;
  activePage: any = 1;
  totalPages: any = 1;
  currentshoppinglist: any;
  shoppinglistempty: any = true;
  search_history: any;
  search_tags: any;
  search_tag_progress: any = false;
  showView = '';
  pageBannersImage: any;
  pageBannersContent: any;
  swiperModules = [IonicSlides];
  recentSwiperModules = [IonicSlides];
  lowPriceSwiperModules = [IonicSlides];
  featuredAdSwiperModules = [IonicSlides];
  searchHistorySwiperModules = [IonicSlides];
  previous_search: any = [];
  deviceOs: any;
  home_slide: any;
  show_progress = true;
  android_search_bg: any;
  feature_banner_placement: any;
  showTitleSearchBar = false;
  deviceId = '';

  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef;

  constructor(
    public dataservice: DataService,
    private util: UtilService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  onSearchScroll(event: any) {
    if (this.searchActive) {
      const scrollTop = event.detail.scrollTop; // Get the scroll position
      // Toggle visibility based on scroll position
      if (scrollTop > 600) {
        this.showTitleSearchBar = true; // Show search bar
      } else {
        this.showTitleSearchBar = false; // Hide search bar
      }
    } else {
      this.showTitleSearchBar = false;
    }
  }

  shareProduct(url: any, title: any) {
    this.util.shareOnWhatsApp(url, title);
  }

  // GET ALL PRODUCTS
  async getProductOnSale() {
    const excludedCategoryIds = [437, 88];
    // load cached data
    this.dataservice.doGetSaleProductsCache().then((sale_cached: any) => {
      if (sale_cached.value) {
        this.onsaleProducts = JSON.parse(sale_cached.value);
      }
    });
    // load server data
    await this.dataservice
      .doProductsFilterGet('20', '1', '&on_sale=true')
      .then((data: any) => {
        const filteredProducts = data.data;
        this.onsaleProducts = filteredProducts?.filter(
          (product: any) =>
            !product.categories.some((category: any) =>
              excludedCategoryIds.includes(category.id)
            )
        );
        this.onsaleProducts = this.onsaleProducts.slice(0, 6);
        this.dataservice.doStoreSaleProductsCache(
          JSON.stringify(this.onsaleProducts.slice(0, 6))
        );
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async getProductFeatured() {
    // load cached data
    this.dataservice
      .doGetFeaturedProductsCache()
      .then((featured_cached: any) => {
        if (featured_cached.value) {
          this.featuredProducts = JSON.parse(featured_cached.value);
        }
      });
    // load server data
    await this.dataservice
      .doProductsFilterGet('20', '1', '&featured=true')
      .then((data: any) => {
        this.featuredProducts = data.data;
        this.dataservice.doStoreFeaturedProductsCache(
          JSON.stringify(this.featuredProducts)
        );
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async featuredHomeBanners() {
    await this.dataservice.doGetPage('home').then((data: any) => {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = data.data[0].content.rendered;

      if (tempElement.querySelectorAll('.position-01')[0]?.innerHTML) {
        this.feature_banner_placement = '1';
      } else if (tempElement.querySelectorAll('.position-02')[0]?.innerHTML) {
        this.feature_banner_placement = '2';
      } else {
        this.feature_banner_placement = '1';
      }

      // LIVE SITE BANNERS
      const divElements = tempElement.querySelectorAll(
        '.feature-section .single-hero-slider'
      );

      divElements.forEach((divElement: any) => {
        divElement.innerHTML = divElement.innerHTML.replace(
          '/west/',
          '/tabs/products/false/'
        );
        let styleAttribute = divElement.getAttribute('style');
        divElement.slideimage = `${styleAttribute}; background-repeat: no-repeat; background-size: cover; height: 0; height: 0; padding-bottom: 50%;`;
      });

      this.home_slide = divElements;
    });
  }

  featuredBackground(image?: any) {
    const newbackground = image.replace('https://', 'https://i0.wp.com/');
    return newbackground;
  }

  async getProductBundles() {
    // load cached data
    this.dataservice.doGetBundleCache().then((bundle_cached: any) => {
      if (bundle_cached.value) {
        this.bundlesProducts = JSON.parse(bundle_cached.value);
      }
    });
    // load server data
    await this.dataservice
      .doProductsBundlesGet('60', '1')
      .then((data: any) => {
        this.bundlesProducts = data.data;
        this.dataservice.doStoreBundleCache(
          JSON.stringify(this.bundlesProducts)
        );
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async getProductLowPriced() {
    // load cached data
    this.dataservice.doGetLowPricedCache().then((lowpriced_cached: any) => {
      if (lowpriced_cached.value) {
        this.featuredProducts = JSON.parse(lowpriced_cached.value);
      }
    });
    // load server data
    await this.dataservice
      .doProductsFilterGet(
        '20',
        '1',
        '&min_price=0&max_price=200&orderby=popularity&order=desc'
      )
      .then((data: any) => {
        this.lowPricedProducts = data.data;
        this.dataservice.doLowPricedCache(
          JSON.stringify(this.lowPricedProducts)
        );
        this.show_progress = false;
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  // check bundle quanty fron meta data
  getBundleQuantity(meta_data: any) {
    const woosbIds = meta_data.filter((meta: any) => meta.key === 'woosb_ids');
    const woosbValue = woosbIds[0].value;

    // Loop through the array and check for the "qty" property
    let qty;
    for (let value of woosbValue) {
      if (value.hasOwnProperty('qty')) {
        qty = value.qty;
        break;
      }
    }
  }

  async searchProduct(ev: any) {
    // Reset Search when new search active
    if (
      ev?.detail.value !== this.searchTerm?.detail.value &&
      this.activePage > 1
    ) {
      this.activePage = 1;
    }

    // Assign search valuse
    this.searchTerm = ev;
    let search = ev.detail.value;
    if (search.length > 2) {
      this.searchTagsHint(search);
      await this.dataservice
        .doProductsSearchGet(search, `${this.activePage}`)
        .then((data: any) => {
          this.totalPages = data.headers['x-wp-totalpages'];
          if (this.activePage > 1) {
            this.productsSearch = [...this.productsSearch, ...data.data];
          } else {
            this.productsSearch = data.data;
          }

          // handle incorrect search
          if (this.productsSearch.length === 0) {
            let alt_search: string = search.substring(0, 3);
            this.dataservice
              .doProductsSearchGet(alt_search, `${this.activePage}`)
              .then((relSearch: any) => {
                if (this.activePage > 1) {
                  this.productsSearch = [
                    ...this.productsSearch,
                    ...relSearch.data,
                  ];
                } else {
                  this.productsSearch = relSearch.data;
                }
              });
          }
          // end handle incorrect search
        })
        .catch((e: any) => {
          console.log(e);
        });
      this.searchActive = true;
      this.showView = 'display: none';
    } else {
      this.searchActive = false;
      this.showView = '';
    }
  }

  onSearchCancel(ev: any) {
    this.searchActive = false;
    this.showView = 'display: block';
  }

  // Search products by tags
  async searchTagsHint(tags: any) {
    this.dataservice.doProductTagsGet(`${tags}`).then((search_tag: any) => {
      if (search_tag) {
        this.search_tags = search_tag.data;
      }
    });
  }

  async searchProductsByTags(tags: any) {
    this.search_tag_progress = true;
    if (tags) {
      await this.dataservice
        .doProductsByTagsGet(`${tags}`, `${this.activePage}`)
        .then((data: any) => {
          this.productsSearch = data.data;
          this.search_tag_progress = false;
        })
        .catch((e: any) => {
          console.log(e);
        });
      this.searchActive = true;
    } else {
      this.searchActive = false;
    }
  }
  // Search products by tags

  async searchIonInfinite(ev: any) {
    this.activePage++;
    this.searchProduct(this.searchTerm);

    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  async getShoppingList() {
    await this.dataservice.doGetShoppingList().then((data: any) => {
      if (data.value) {
        this.currentshoppinglist = JSON.parse(data.value);
        this.shoppinglistempty = false;
      } else {
        this.shoppinglistempty = true;
        this.currentshoppinglist = null;
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

  async searchNavigate(searchId: any) {
    await this.dataservice.doGetSaveSearch().then((data: any) => {
      var searchFilter: any = [];
      this.search_history = JSON.parse(data.value);
      if (this.search_history) {
        searchFilter = this.search_history.filter(
          (list: any) => list.id === searchId
        );
      }
      if (searchFilter.length == 0) {
        let search_terms = [
          {
            id: searchId,
          },
        ];
        if (this.search_history) {
          search_terms = [...this.search_history, ...search_terms];
        }
        this.dataservice.doSaveSearch(JSON.stringify(search_terms));
      }
      this.router.navigate(['/tabs/productdetail/', searchId]);
    });
  }

  async previousSearch() {
    await this.dataservice.doGetSaveSearch().then((data: any) => {
      if (data.value) {
        const search_history = JSON.parse(data.value);
        if (data) {
          if (this.previous_search.length <= search_history.length - 1) {
            search_history.forEach((search: any) => {
              this.dataservice.doProductGet(search.id).then((data: any) => {
                if (this.previous_search.length < search_history.length) {
                  this.previous_search.push(data.data);
                }
                // SORT DATA ASCENDING
                if (this.previous_search) {
                  this.previous_search.sort((a: any, b: any) => a.id - b.id);
                }
              });
            });
          }
        }
      }
    });
  }

  async openScanner() {
    const modal = await this.modalCtrl.create({
      component: BcscannerPage,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();
  }

  async getRecentViewedProducts() {
    await this.dataservice
      .doGetRecentViewed()
      .then((data: any) => {
        if (data) {
          if (
            !this.dataservice.global_recent_view ||
            this.dataservice.global_recent_view.length === 0
          ) {
            this.dataservice.global_recent_view = JSON.parse(data.value);
            this.recentViewedProducts = JSON.parse(data.value);
          }
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  refreshView(e: any) {
    this.reloadScreen();
    if (this.featuredProducts) {
      e.target.complete();
    }
  }

  reloadScreen() {
    this.show_progress = true;
    this.getProductOnSale();
    this.getProductBundles();
    this.getProductFeatured();
    this.getProductLowPriced();
    this.featuredHomeBanners();
    setTimeout(() => {
      this.show_progress = false;
    }, 1000);
  }

  async setupPageData() {
    // Set global device info
    const info = await Device.getInfo();
    this.deviceOs = info.platform;
    if (this.deviceOs == 'android') {
      this.android_search_bg = 'background-color: #00829fd0;';
    }

    // Show the splash for an indefinite amount of time:
    await SplashScreen.show({
      autoHide: false,
    });
    this.getProductOnSale();
    this.getProductBundles();
    this.getProductFeatured();
    this.getShoppingList();
    this.getProductLowPriced();
    this.featuredHomeBanners();

    // Sync with stored items
    this.getRecentViewedProducts();
    // Sync customer data
    SplashScreen.hide();
    this.util.syncShoplistData();
  }

  async openDeals(notification_payload?: any) {
    if (notification_payload.notification.data?.category) {
      this.router.navigate([
        '/tabs/products/',
        'false',
        notification_payload.notification.data?.category,
      ]);
    } else if (notification_payload.notification.data?.product) {
      this.router.navigate([
        '/tabs/productdetail/',
        notification_payload.notification.data?.product,
      ]);
    } else if (
      notification_payload.notification.data?.post ||
      notification_payload.notification.data?.page
    ) {
      const modal = await this.modalCtrl.create({
        component: NewdealPage,
        componentProps: {
          notification: notification_payload,
        },
        breakpoints: [0, 0.6, 1],
        initialBreakpoint: 0.6,
      });
      modal.present();
    } else if (notification_payload.notification.data?.route) {
      this.router.navigate([notification_payload.notification.data?.route]);
    } else {
      this.util.presentAlertToast(
        notification_payload.body,
        'alert-circle-outline'
      );
    }
  }

  // HANDLE PUSH NOTIFICATIONS
  pushNotifications() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      if (token !== this.dataservice.global_auth.pushToken) {
        this.dataservice.global_auth.pushToken = token.value;
        this.dataservice.doSaveUser(
          JSON.stringify(this.dataservice.global_auth)
        );
      }
      console.log('Push registration success, token: ' + token.value);
      this.deviceId = token.value;
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // alert(notification.body);
        this.openDeals(notification);
        this.resetBadgeCount();
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        this.openDeals(notification);
        this.resetBadgeCount();
      }
    );
  }

  // Reset notification badge count
  resetBadgeCount() {
    PushNotifications.removeAllDeliveredNotifications();
  }
  // HANDLE PUSH NOTIFICATIONS

  ionViewWillLeave() {}

  ionViewWillEnter() {}

  ngOnInit() {
    this.setupPageData();
    this.pushNotifications();
    // this.util.swipeToGoBack();
  }
}
