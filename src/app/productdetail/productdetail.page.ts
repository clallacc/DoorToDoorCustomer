import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InfiniteScrollCustomEvent,
  IonicModule,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { UtilService } from '../services/util.service';
import { IonicSlides } from '@ionic/angular';
import { LoginregisterPage } from '../loginregister/loginregister.page';

@Component({
  selector: 'app-productdetail',
  templateUrl: './productdetail.page.html',
  styleUrls: ['./productdetail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductdetailPage implements OnInit {
  searchActive = false;
  productsSearch: any;
  searchTerm: any;
  search_tags: any;
  search_tag_progress: any = false;
  activeSearchPage: any = 1;
  totalPages: any = 1;
  product: any;
  productId: any;

  cartQuantity: any = 1;
  relatedProducts: any = [];
  search_history: any;
  previous_search: any = [];
  deviceOs: any;
  searchHistorySwiperModules = [IonicSlides];
  relatedSwiperModules = [IonicSlides];
  android_search_bg: any;
  customerDetails: any;
  showTitleSearchBar = false;
  detailType = 'description';
  reviewFormActive = false;
  productRating = 1;
  productReviews: any;

  rateStarSelect01 = 'star-outline';
  rateStarSelect02 = 'star-outline';
  rateStarSelect03 = 'star-outline';
  rateStarSelect04 = 'star-outline';
  rateStarSelect05 = 'star-outline';
  reviewComment: any;
  reviewerName: any;

  id: any;
  name: any;
  images: any;
  price: any;
  price_html: any;
  on_sale: any;
  regular_price: any;
  description: any;
  categories: any;
  sku: any;
  stock_status: any;
  total_sales: any;
  rating_count: any;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private activeRoute: ActivatedRoute,
    private loc: Location,
    public router: Router,
    private modalCtrl: ModalController
  ) {}

  goBack() {
    this.loc.back();
  }

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

  async getProduct(id: any) {
    this.deviceOs = this.dataservice.global_OS;
    if (this.deviceOs == 'android') {
      this.android_search_bg = 'background-color: #00829fd0;';
    }
    this.relatedProducts = [];
    await this.dataservice
      .doProductGet(id)
      .then((data: any) => {
        if (data.data) {
          this.product = data.data;
          this.id = this.product.id;
          this.name = this.product.name;
          this.sku = this.product.sku;
          this.images = this.product.images[0];
          this.price = this.product.price;
          this.price_html = this.product.price_html;
          this.on_sale = this.product.on_sale;
          this.regular_price = this.product.regular_price;
          this.categories = this.product.categories;
          this.description = this.product.description;
          this.stock_status = this.product.stock_status;
          this.total_sales = this.product.total_sales;
          this.rating_count = this.product.rating_count;
          let count = 0;
          if (this.product.related_ids[0]) {
            for (let related of this.product.related_ids) {
              if (count === 3) {
                break;
              }
              this.getRelatedProducts(related);
              count++;
            }
          }
        }
        this.getProductReviews(id);
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async getProductReviews(id: any) {
    this.dataservice
      .doGetProductReview(id)
      .then((reviewResp: any) => {
        if (reviewResp.data) {
          this.productReviews = reviewResp.data;
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async getRelatedProducts(id: any) {
    await this.dataservice
      .doRelatedProductGet(id)
      .then((data: any) => {
        this.relatedProducts.push(data.data);
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  quantityUp() {
    this.cartQuantity++;
  }

  quantityDown() {
    if (this.cartQuantity > 1) {
      this.cartQuantity--;
    }
  }

  updateCart(id: any, data: any, images?: any, quantity?: any) {
    this.util.updateCart(id, data, images, quantity);
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    this.util.addToShoppingList(id, data, images, quantity);
  }

  async createReviewClicked() {
    if (!this.dataservice.global_auth.email) {
      const modal = await this.modalCtrl.create({
        component: LoginregisterPage,
        componentProps: {
          page: 'signin',
        },
        breakpoints: [0, 0.5, 1],
        initialBreakpoint: 0.5,
      });
      modal.present();
    } else {
      this.reviewFormActive = true;
    }
  }

  ratingSelect(rate: number) {
    this.productRating = rate;
    this.rateStarSelect02 = 'star-outline';
    this.rateStarSelect03 = 'star-outline';
    this.rateStarSelect04 = 'star-outline';
    this.rateStarSelect05 = 'star-outline';
    switch (rate) {
      case 2:
        this.rateStarSelect01 = 'star';
        this.rateStarSelect02 = 'star';
        break;
      case 3:
        this.rateStarSelect01 = 'star';
        this.rateStarSelect02 = 'star';
        this.rateStarSelect03 = 'star';
        break;
      case 4:
        this.rateStarSelect01 = 'star';
        this.rateStarSelect02 = 'star';
        this.rateStarSelect03 = 'star';
        this.rateStarSelect04 = 'star';
        break;
      case 5:
        this.rateStarSelect01 = 'star';
        this.rateStarSelect02 = 'star';
        this.rateStarSelect03 = 'star';
        this.rateStarSelect04 = 'star';
        this.rateStarSelect05 = 'star';
        break;
    }
  }

  setNickname(name: any) {
    this.reviewerName = name.detail.value;
  }

  setComment(comment: any) {
    this.reviewComment = comment.detail.value;
  }

  submitReview() {
    const review = {
      product_id: this.id,
      review: this.reviewComment,
      reviewer: this.reviewerName,
      reviewer_email: this.dataservice.global_auth.email,
      rating: this.productRating,
    };
    console.log('review', review);
    if (this.reviewerName) {
      this.dataservice
        .doCreateReview(review)
        .then((resp: any) => {
          console.log('resp', resp);
          this.util.presentAlertToast(
            'Your review was submitted',
            'chatbox',
            'light'
          );
        })
        .catch((e: any) => {
          console.log('error', e);
          this.util.presentAlertToast(
            'Something unexpected happened. please try again.',
            'chatbox',
            'warning'
          );
        });

      this.reviewFormActive = false;
    } else {
      this.util.presentAlertToast(
        'Please enter a Nickname',
        'chatbox',
        'warning'
      );
    }
  }

  async searchProduct(ev: any) {
    // Reset Search when new search active
    if (
      ev?.detail.value !== this.searchTerm?.detail.value &&
      this.activeSearchPage > 1
    ) {
      this.activeSearchPage = 1;
    }

    // Assign search valuse
    this.searchTerm = ev;
    let search = ev.detail.value;
    if (search.length > 2) {
      this.searchTagsHint(search);
      await this.dataservice
        .doProductsSearchGet(search, `${this.activeSearchPage}`)
        .then((data: any) => {
          this.totalPages = data.headers['x-wp-totalpages'];
          if (this.activeSearchPage > 1) {
            this.productsSearch = [...this.productsSearch, ...data.data];
          } else {
            this.productsSearch = data.data;
          }
          // handle incorrect search
          if (this.productsSearch.length === 0) {
            let alt_search: string = search.substring(0, 3);
            this.dataservice
              .doProductsSearchGet(alt_search, `${this.activeSearchPage}`)
              .then((relSearch: any) => {
                if (this.activeSearchPage > 1) {
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
    } else {
      this.searchActive = false;
    }
  }

  // Search products by tags
  async searchTagsHint(tags: any) {
    this.dataservice.doProductTagsGet(tags).then((search_tag: any) => {
      if (search_tag) {
        this.search_tags = search_tag.data;
      }
    });
  }

  async searchProductsByTags(tags: any) {
    this.search_tag_progress = true;
    if (tags) {
      await this.dataservice
        .doProductsByTagsGet(`${tags}`, `${this.activeSearchPage}`)
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
    this.activeSearchPage++;
    this.searchProduct(this.searchTerm);

    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  calculateSavings(regPrice: any, price: any, quant: any) {
    const savings = (regPrice - price) * quant;
    return savings.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
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
        console.log('ser', searchFilter);
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

  storeRecentViewed(data: any, quantity?: any) {
    var productData: any = [];
    delete data['meta_data'];
    productData.push(data);
    productData.map((item: any) => {
      productData = [{ ...item, quantity: quantity }];
    });

    if (this.dataservice.global_recent_view?.length > 0) {
      let filterCart = this.dataservice.global_cart.filter(
        (list: any) => list.id === data.id
      );
      let filterRecent = this.dataservice.global_recent_view.filter(
        (recent: any) => recent.id === data.id
      );
      if (filterCart.length === 0 && filterRecent.length === 0) {
        this.dataservice.global_recent_view.push(...productData);
      }
    } else {
      this.dataservice.global_recent_view = productData;
    }
    this.dataservice.doStoreRecentViewed(
      JSON.stringify(this.dataservice.global_recent_view)
    );
  }

  ionViewDidEnter() {}
  ionViewDidLeave() {
    this.storeRecentViewed(this.product, '1');
  }

  ngOnInit() {
    this.productId = this.activeRoute.params.subscribe((data: any) => {
      this.productId = data['id'];
      this.getProduct(this.productId);
      this.customerDetails = this.dataservice.global_auth;
    });
  }
}
