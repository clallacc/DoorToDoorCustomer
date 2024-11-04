import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { Device } from '@capacitor/device';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { Observable, timeInterval } from 'rxjs';

// Define the interface for the notification data structure
interface PushNotification {
  id: string;
  body: string;
  smallIcon: string;
  extra: {
    page: string;
    category: string;
    product: string;
  };
  title: string;
  schedule: {
    at: any; // Adjust type if you have a specific structure for 'at'
  };
  actionTypeId: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  android_cart_btn: any;
  deviceOs: any;
  firepush_data: any = [];

  private db = getFirestore(initializeApp(environment.firebaseConfig));

  constructor(private util: UtilService, private dataservice: DataService) {
    this.util.syncCustomerData();
    // Sync with stored items
    this.syncShoplist();
    this.syncSavedCart();
    this.deviceInfo();
    // this.getPushNotificationFromFirestore();
    // Sync customer data
  }

  syncFireStorePushNotifications(): Observable<any[]> {
    const collectionRef = collection(this.db, 'd2d-app-push-notifications');

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot) => {
          const notifications: any[] = [];

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            const dataID = change.doc.id;

            switch (change.type) {
              case 'added':
                notifications.push({
                  id: change.doc.id,
                  ...data,
                  docId: dataID,
                });
                if (
                  this.dataservice.global_firestore_campaigns.length > 0 &&
                  this.dataservice.global_firestore_campaigns?.length <
                    snapshot.docs.length
                ) {
                  this.addNewNotifications(data);
                }
                console.log('added document: ', data);
                break;
              case 'modified':
                this.getPushNotificationFromFirestore();
                console.log('updated document: ', data);
                break;
              case 'removed':
                this.getPushNotificationFromFirestore();
                console.log('Removed document: ', data);
                break;
            }
          });

          // Sort notifications in descending order based on schedule.at
          const sortedNotifications = notifications.sort((a, b) => {
            const dateA = a.schedule?.at
              ? new Date(a.schedule.at)
              : new Date(0);
            const dateB = b.schedule?.at
              ? new Date(b.schedule.at)
              : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Descending order
          });

          observer.next(sortedNotifications); // Emit the sorted notifications array
        },
        (error) => {
          console.error('Error fetching collection: ', error);
          observer.error(error); // Emit error if there's an issue
        }
      );

      // Cleanup subscription on unsubscribe
      return () => unsubscribe();
    });
  }

  async getPushNotificationFromFirestore() {
    let routeLink: string = '/tabs/home';
    let routerId: string = '';

    this.syncFireStorePushNotifications().subscribe({
      next: (data) => {
        // set global firestore notifications
        if (data) {
          this.dataservice.global_firestore_campaigns = data;
        }

        data.forEach((doc) => {
          const dataWithId = doc as PushNotification;

          // Convert schedule.at to a Date object if it's not already
          if (dataWithId.schedule && dataWithId.schedule.at) {
            dataWithId.schedule.at = new Date(dataWithId.schedule.at);
          }

          if (dataWithId.extra && dataWithId.extra.product) {
            routeLink = '/tabs/productdetail/';
            routerId = dataWithId.extra.product;
          } else if (dataWithId.extra && dataWithId.extra.category) {
            routeLink = '/tabs/products/';
            routerId = dataWithId.extra.category;
          } else {
            routeLink = '/tabs/home/';
          }
          const currentTime = new Date(Date.now());
          if (currentTime < dataWithId.schedule.at) {
            this.util.firestorePushNotification(
              dataWithId,
              routeLink,
              routerId
            );
          }
        });
      },
      error: (error) => {
        console.error('Error receiving notifications: ', error);
      },
    });
  }

  addNewNotifications(push_data: any) {
    let routeLink: string = '/tabs/home';
    let routerId: string = '';
    if (push_data.extra && push_data.extra.product) {
      routeLink = '/tabs/productdetail/';
      routerId = push_data.extra.product;
    } else if (push_data.extra && push_data.extra.category) {
      routeLink = '/tabs/products/';
      routerId = push_data.extra.category;
    } else {
      routeLink = '/tabs/home/';
    }
    const currentTime = new Date(Date.now());
    if (currentTime < push_data.schedule.at) {
      this.util.firestorePushNotification(push_data, routeLink, routerId);
    }
  }

  async syncShoplist() {
    await this.dataservice.doGetShoppingList().then((data: any) => {
      if (data) {
        if (
          !this.dataservice.global_shopping_list ||
          this.dataservice.global_shopping_list.length === 0
        ) {
          this.dataservice.global_shopping_list = JSON.parse(data.value);
        }
      }
    });
  }

  async syncSavedCart() {
    await this.dataservice.doGetCart().then((data: any) => {
      if (data.value) {
        if (this.dataservice.global_cart.length === 0) {
          this.dataservice.global_cart = JSON.parse(data.value);
        }
      }
    });
  }

  // Check device info
  async deviceInfo() {
    // Check if runnng android
    const info = await Device.getInfo();
    this.dataservice.global_OS = info.platform;
    this.deviceOs = this.dataservice.global_OS;
    if (this.dataservice.global_OS == 'android') {
      this.android_cart_btn = 'padding: 5px 5px;';
    }
  }
}
