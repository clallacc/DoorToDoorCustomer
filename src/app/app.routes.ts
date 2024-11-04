import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'loginregister',
    loadComponent: () =>
      import('./loginregister/loginregister.page').then(
        (m) => m.LoginregisterPage
      ),
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.page').then( m => m.OrdersPage)
  },
  {
    path: 'userdetails',
    loadComponent: () => import('./userdetails/userdetails.page').then( m => m.UserdetailsPage)
  },
  {
    path: 'customer',
    loadComponent: () => import('./customer/customer.page').then( m => m.CustomerPage)
  },
  {
    path: 'recipes',
    loadComponent: () => import('./recipes/recipes.page').then( m => m.RecipesPage)
  },
  {
    path: 'addpayment',
    loadComponent: () => import('./addpayment/addpayment.page').then( m => m.AddpaymentPage)
  },
  {
    path: 'newdeal',
    loadComponent: () => import('./newdeal/newdeal.page').then( m => m.NewdealPage)
  },
  {
    path: 'sentnotification',
    loadComponent: () => import('./sentnotification/sentnotification.page').then( m => m.SentnotificationPage)
  },
];
