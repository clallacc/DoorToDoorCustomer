import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonAccordionGroup,
  IonicModule,
  ModalController,
  AlertController,
} from '@ionic/angular';
import { LoginregisterPage } from '../loginregister/loginregister.page';
import { DataService } from '../services/data.service';
import { Router, RouterModule } from '@angular/router';
import { OrdersPage } from '../orders/orders.page';
import { CustomerPage } from '../customer/customer.page';
import { RecipesPage } from '../recipes/recipes.page';
import { UtilService } from '../services/util.service';
import { AddpaymentPage } from '../addpayment/addpayment.page';
import { SentnotificationPage } from '../sentnotification/sentnotification.page';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [LoginregisterPage],
})
export class AccountPage implements OnInit {
  categories: any = [];
  sub_categories: any = [];
  userData: any;
  disabled: any = true;
  modal: any;
  deviceOs: any;
  user_role: any;
  server_site: any = localStorage.getItem('d2d_site_server');

  @ViewChild('accordionGroup', { static: false }) accordionGroup:
    | IonAccordionGroup
    | undefined;

  message =
    'This modal example uses the modalController to present and dismiss modals.';
  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private location: Location,
    private modalCtrl: ModalController,
    private router: Router,
    private alertController: AlertController
  ) {}

  goBack() {
    this.location.back();
  }

  async userLoginStatus() {
    this.dataservice.doGetuser().then((user: any) => {
      const userdata = JSON.parse(user.value);
      if (userdata && userdata.token) {
        this.disabled = false;
        this.userData = JSON.parse(user.value);
        this.dataservice.global_auth = this.userData;
      } else {
        this.disabled = true;
      }
    });
  }

  async retrieveOrders() {
    const modal = await this.modalCtrl.create({
      component: OrdersPage,
      componentProps: {
        page: 'hello',
      },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
  }

  async retrieveCustomerDetails() {
    const modal = await this.modalCtrl.create({
      component: CustomerPage,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();

    modal.onDidDismiss().then(() => {
      // Call your function here when dismissed
      this.userLoginStatus();
    });
  }

  async pushNotificationMenu() {
    const modal = await this.modalCtrl.create({
      component: SentnotificationPage,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();
  }

  async loadcategories() {
    await this.dataservice
      .doGetCategories()
      .then((data: any) => {
        const jsonArr = data.data;
        for (let jsonRecords of jsonArr) {
          const nameStr = jsonRecords.name;
          const firstChar = nameStr[0];
          if (firstChar != '*') {
            if (jsonRecords.name != 'SPECIAL PRODUCTS') {
              this.categories.push(jsonRecords);
            }
          }
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  async loadSubCategories(parent: any) {
    this.sub_categories = null;
    await this.dataservice
      .doGetSubCategory(parent)
      .then((data: any) => {
        this.sub_categories = data.data;
        if (this.sub_categories.length === 0) {
          this.dataservice
            .doGetCategory(parent)
            .then((category: any) => {
              this.sub_categories = [];
              this.sub_categories.push(category.data);
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

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  navigateCategory(category_id: any) {
    this.router.navigate(['/tabs/products/', 'false', category_id]);
  }

  async openSignup(page: any) {
    const modal = await this.modalCtrl.create({
      component: LoginregisterPage,
      componentProps: {
        page: page,
      },
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();

    modal.onDidDismiss().then((data) => {
      this.userLoginStatus();
      this.disabled = data.data?.disabled;
    });

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }

  async openRecipes() {
    const modal = await this.modalCtrl.create({
      component: RecipesPage,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.5,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }

  async storedCCPaymentMethod(value: boolean) {
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
      this.dataservice.global_auth;
    });
  }

  signOut() {
    this.dataservice.doRemoveSaveUser();
    this.dataservice.global_auth = [];
    this.disabled = true;
    this.userLoginStatus();
  }

  async removeUser() {
    const alert = await this.alertController.create({
      header: 'Confirm Removal',
      message: 'Do you want to remove this user and user data?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('User canceled the removal.');
          },
        },
        {
          text: 'OK',
          handler: () => {
            this.removeAllData();
          },
        },
      ],
    });

    await alert.present();
  }

  removeAllData() {
    this.dataservice.doRemoveSaveUser();
    this.dataservice.global_auth = [];
    this.dataservice.doDeleteSaveSearch();
    this.dataservice.doRemoveShoppingList();
    this.dataservice.doRemoveCart();
    this.dataservice.doDeleteSaveSearch();
    this.disabled = true;
    this.userLoginStatus();
    this.util.presentAlertToast(
      'User account data removed successfully',
      'information-circle-outline',
      'light'
    );
  }

  ionViewDidEnter() {
    if (!this.userData) {
      this.userLoginStatus();
    }
  }

  ngOnInit() {
    this.deviceOs = this.dataservice.global_OS;
    this.userLoginStatus();
    this.loadcategories();
  }
}
