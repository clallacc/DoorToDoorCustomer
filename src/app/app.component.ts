import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { UtilService } from './services/util.service';
register();

// setup local notifications
import { Platform } from '@ionic/angular';
import { NotificationService } from './services/notification.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class AppComponent {
  public environmentInjector = inject(EnvironmentInjector);
  categories: any = [];
  foregroundNotifications = false; // Initialize to false
  foregroundNotificationsData: any;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private platform: Platform,
    private notificationService: NotificationService
  ) {
    // D2D local notifications
    this.initializeApp();
    this.getProductsCategories();
  }

  // Initalize D2D local notifications
  async initializeApp() {
    await this.platform.ready();
    await this.notificationService.initializePushNotifications();
    this.util.getFirestoreNotidications();

    // Handle back button
    this.platform.backButton.subscribeWithPriority(-1, () => {
      App.exitApp();
    });

    // Subscribe to notification updates
    this.notificationService.forgroundNotificationData$.subscribe((data) => {
      if (data.length > 0) {
        this.foregroundNotifications = true;
        this.foregroundNotificationsData = data[0]; // Assuming you want to show the latest notification
      } else {
        this.foregroundNotifications = false;
        this.foregroundNotificationsData = null;
      }
    });
  }

  async getProductsCategories() {
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

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  closeNotification() {
    this.notificationService.setShowForegroundNotification(false);
    this.notificationService.setForegroundNotificationData([]);
  }
}
