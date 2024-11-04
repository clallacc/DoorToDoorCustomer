import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('../cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('../checkout/checkout.page').then((m) => m.CheckoutPage),
      },
      {
        path: 'shoplist',
        loadComponent: () =>
          import('../shoplist/shoplist.page').then((m) => m.ShoplistPage),
      },
      {
        path: 'products/:feature/:category',
        loadComponent: () =>
          import('../products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'productdetail/:id',
        loadComponent: () =>
          import('../productdetail/productdetail.page').then(
            (m) => m.ProductdetailPage
          ),
      },
      {
        path: 'bcscanner',
        loadComponent: () =>
          import('../bcscanner/bcscanner.page').then((m) => m.BcscannerPage),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('../account/account.page').then((m) => m.AccountPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
