import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

interface NotificationData {
  id: number;
  title: string;
  body: string;
  actionTypeId?: string;
  extra?: any; // Adjust this type based on your needs
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private isBackground = false;
  public showForgroundNotification = false;
  public forgroundNotificationData: any;

  // setup passing data to forground notifications
  private _showForegroundNotification = new BehaviorSubject<boolean>(false);
  showForegroundNotification$ = this._showForegroundNotification.asObservable();

  private _forgroundNotificationData = new BehaviorSubject<NotificationData[]>(
    []
  );
  forgroundNotificationData$ = this._forgroundNotificationData.asObservable();

  constructor(private platform: Platform) {
    this.setupAppStateListeners();
  }

  // triger forground notifications
  setShowForegroundNotification(value: boolean) {
    this._showForegroundNotification.next(value);
  }

  setForegroundNotificationData(data: NotificationData[]) {
    this._forgroundNotificationData.next(data);
  }

  private setupAppStateListeners() {
    App.addListener('appStateChange', ({ isActive }) => {
      this.isBackground = !isActive;
      if (isActive) {
        // this.setupFirestoreListener();
        this.setupForgroundFirestoreListener();
      } else {
        // this.setupFirestoreListener();
        this.setupBackgroundFirestoreListener();
      }
    });
  }

  async initializePushNotifications() {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
          await PushNotifications.register();
          await this.setupNotificationChannels();
          // this.setupFirestoreListener();
          this.setupNotificationListeners();
          this.setupAppStateListeners();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    }
  }

  private async setupNotificationChannels() {
    if (this.platform.is('android')) {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 5,
        description: 'Default notification channel',
        sound: 'beep.wav',
        visibility: 1,
        vibration: true,
      });
    }
  }

  private setupNotificationListeners() {
    // Registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success:', token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', error);
    });

    // Push notification received
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push received:', notification);
        // Handle the notification when the app is in the foreground
        this.setShowForegroundNotification(true);
        this.setForegroundNotificationData([notification.data]);
      }
    );

    // Push notification action clicked
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push action performed:', notification);
      }
    );
  }

  // private setupFirestoreListener() {
  //   const unsubscribe = onSnapshot(
  //     collection(getFirestore(), 'd2d-app-push-notifications'),
  //     (snapshot) => {
  //       snapshot.docChanges().forEach(async (change) => {
  //         if (change.type === 'added' || change.type === 'modified') {
  //           const data = change.doc.data();
  //           await this.handleNotification(data);
  //         }
  //       });
  //     }
  //   );

  //   // Cleanup subscription when app goes to background
  //   App.addListener('appStateChange', ({ isActive }) => {
  //     if (!isActive) {
  //       unsubscribe();
  //     }
  //   });
  // }

  private setupForgroundFirestoreListener() {
    const unsubscribe = onSnapshot(
      collection(getFirestore(), 'd2d-app-push-notifications'),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            await this.handleForgroundNotification(data);
          }
        });
      }
    );

    // Cleanup subscription when app goes to background
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        unsubscribe();
      }
    });
  }

  private setupBackgroundFirestoreListener() {
    const unsubscribe = onSnapshot(
      collection(getFirestore(), 'd2d-app-push-notifications'),
      (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            await this.handleBackgroundNotification(data);
          }
        });
      }
    );

    // Cleanup subscription when app goes to background
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        unsubscribe();
      }
    });
  }

  private async handleBackgroundNotification(data: any) {
    try {
      const notificationId = Math.floor(Math.random() * 100000);
      const currentTime = new Date(Date.now());
      const schedule = new Date(data.schedule);

      console.log('currentTime - ', currentTime);
      console.log('schedule - ', schedule);
      console.log('data - ', data);
      if (schedule > currentTime) {
        console.log('d2d notification sent - ', data.id);
        await LocalNotifications.schedule({
          notifications: [
            {
              id: data.id,
              title: data.title || 'Door to Door',
              body: data.body || 'You have a new update',
              schedule: { at: schedule },
              channelId: 'default',
              sound: 'beep.wav',
              smallIcon: 'ic_stat_icon_config_sample',
              actionTypeId: data.actionTypeId,
              extra: {
                data: JSON.stringify(data.extra),
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  private async handleForgroundNotification(data: any) {
    try {
      const currentTime = new Date(Date.now());
      const schedule = new Date(data.schedule);
      if (schedule > currentTime) {
        this.setShowForegroundNotification(true);
        this.setForegroundNotificationData([data]);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // private async handleNotification(data: any) {
  //   try {
  //     const notificationId = Math.floor(Math.random() * 100000);
  //     const currentTime = new Date(Date.now());
  //     const schedule = new Date(data.schedule);

  //     console.log('currentTime - ', currentTime);
  //     console.log('schedule - ', schedule);
  //     console.log('data - ', data);
  //     if (schedule > currentTime) {
  //       if (this.isBackground) {
  //         console.log('d2d notification sent - ', data.id);
  //         await LocalNotifications.schedule({
  //           notifications: [
  //             {
  //               id: data.id,
  //               title: data.title || 'Door to Door',
  //               body: data.body || 'You have a new update',
  //               schedule: { at: schedule },
  //               channelId: 'default',
  //               sound: 'beep.wav',
  //               smallIcon: 'ic_stat_icon_config_sample',
  //               actionTypeId: data.actionTypeId,
  //               extra: {
  //                 data: JSON.stringify(data.extra),
  //               },
  //             },
  //           ],
  //         });
  //       } else {
  //         // Handle foreground notification
  //         // You can show an in-app alert or update UI
  //         await LocalNotifications.schedule({
  //           notifications: [
  //             {
  //               id: data.id,
  //               title: data.title || 'Door to Door',
  //               body: data.body || 'You have a new update',
  //               schedule: { at: schedule },
  //               channelId: 'default',
  //               sound: 'beep.wav',
  //               smallIcon: 'ic_stat_icon_config_sample',
  //               actionTypeId: data.actionTypeId,
  //               extra: {
  //                 data: JSON.stringify(data.extra),
  //               },
  //             },
  //           ],
  //         });
  //         this.setShowForegroundNotification(true);
  //         this.setForegroundNotificationData([data]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error scheduling notification:', error);
  //   }
  // }
}
