import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InfiniteScrollCustomEvent,
  IonicModule,
  IonicSlides,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsPage implements OnInit {
  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private route: ActivatedRoute,
    private loc: Location,
    private router: Router,
    private loadingCtl: LoadingController
  ) {}
  searchActive = false;
  products: any;
  productsSearch: any;
  searchTerm: any;
  activeSearchPage: any = 1;
  totalPages: any = 1;
  activeFeaturePage: any = 1;
  featureSearch: any;
  productCategories: any;
  categorySearch: any = null;
  search_history: any;
  search_tags: any;
  search_tag_progress: any = false;
  previous_search: any = [];
  category_info: any;
  categorySwiperModules = [IonicSlides];
  searchHistorySwiperModules = [IonicSlides];
  deviceOs: any;
  android_search_bg: any;
  showTitleSearchBar = false;

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

  async getProductOnSale(featureSearch: any) {
    await this.dataservice
      .doProductsFilterGet(
        '20',
        this.activeFeaturePage,
        `&${featureSearch}=true`
      )
      .then((data: any) => {
        if (!this.products) {
          this.products = data.data;
        } else {
          this.products = [...this.products, ...data.data];
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async getCategory(category: any) {
    await this.dataservice.doGetCategory(category).then((data: any) => {
      this.category_info = data.data;
      this.loadSubCategories(this.category_info.id);
    });
  }

  async loadSubCategories(parent: any) {
    this.productCategories = null;
    await this.dataservice
      .doGetSubCategory(parent)
      .then((data: any) => {
        this.productCategories = data.data;
        if (this.productCategories.length === 0) {
          this.dataservice
            .doGetCategory(parent)
            .then((category: any) => {
              this.productCategories = [];
              this.productCategories.push(category.data);
            })
            .catch((e) => {
              console.log(e);
            });
        }
      })
      .catch((e) => {
        console.log(e);
      });
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

  async getProductsInCategories(category: any) {
    await this.dataservice
      .doGetProductsInCategory(category)
      .then((data: any) => {
        if (!this.products) {
          this.products = data.data;
        } else {
          this.products = [...this.products, ...data.data];
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
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

  async productIonInfinite(ev: any) {
    this.activeFeaturePage++;
    if (this.featureSearch != 'false') {
      this.getProductOnSale(this.featureSearch);
    } else {
      this.getProductsInCategories(this.categorySearch);
    }
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
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

  async loader() {
    const loading = await this.loadingCtl.create({
      message: 'Getting things ready',
      spinner: 'dots',
      cssClass: 'dtd-loading',
      duration: 3000,
    });

    loading.present();
  }

  async setupPageData() {
    this.deviceOs = this.dataservice.global_OS;
    if (this.deviceOs == 'android') {
      this.android_search_bg = 'background-color: #00829fd0;';
    }
    this.route.params.subscribe((data: any) => {
      if (data['feature'] != 'false') {
        this.featureSearch = data['feature'];
        this.getProductOnSale(data['feature']);
      } else {
        this.categorySearch = data['category'];
        this.getProductsInCategories(data['category']);
        this.getCategory(this.categorySearch);
      }
    });
  }

  ngOnInit() {
    this.setupPageData();
  }
}
