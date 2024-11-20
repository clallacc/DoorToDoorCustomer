import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UtilService } from '../services/util.service';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sentnotification',
  templateUrl: './sentnotification.page.html',
  styleUrls: ['./sentnotification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SentnotificationPage implements OnInit {
  title: string = '';
  body: string = '';
  schedule_date_time: string = '';
  extra_key: string = '';
  extra_value: string = '';
  updateTitle: string = '';
  updateBody: string = '';
  datetime: any;
  firestore_campaigns: any;
  notice_color: string = '';
  current_date: any;
  customer_email: string = '';
  prime_only: boolean = false;
  show_refresh_progress: any = false;

  constructor(
    private util: UtilService,
    private dataservice: DataService,
    private alert: AlertController
  ) {}

  setupNotificationPop() {
    this.firestore_campaigns = this.dataservice.global_firestore_campaigns;
    this.current_date = new Date(Date.now());
    console.log('this.firestore_campaigns', this.firestore_campaigns);
  }

  convertDateObject(campaign_date: any) {
    // Assuming current_date is initialized as follows
    this.current_date = new Date(Date.now());

    // Assuming campaigns.schedule.at is a valid date string
    const campaign_date_ran = new Date(campaign_date);

    // Check if current_date has passed campaigns.schedule.at
    if (this.current_date > campaign_date_ran) {
      return 'danger';
    } else {
      return;
    }
  }

  setScheduleDateTime(ev: any) {
    this.datetime = new Date(ev.detail.value);
  }

  async firestorePostNotificationData() {
    const delay = 5 * 60 * 500; // 4 minutes in milliseconds
    if (!this.datetime) {
      this.datetime = new Date(Date.now() + delay);
    }
    if (this.title && this.body) {
      let notificationId: number = this.datetime.getTime();
      // const data = {
      //   id: notificationId,
      //   title: this.title,
      //   body: this.body,
      //   smallIcon: 'house',
      //   actionTypeId: 'OPEN_FIREPUSH',
      //   schedule: { at: `${this.datetime}` },
      //   extra:
      //     this.extra_key && this.extra_value
      //       ? { [this.extra_key]: this.extra_value }
      //       : null,
      // };
      const data = {
        id: notificationId,
        title: this.title,
        body: this.body,
        smallIcon: 'house',
        actionTypeId: 'OPEN_FIREPUSH',
        schedule: `${this.datetime}`,
        extra: {
          page_key: this.extra_key ? this.extra_key : null,
          page_id: this.extra_value ? this.extra_key : null,
          prime_only: this.prime_only,
          customer_email: this.customer_email ? this.customer_email : null,
        },
      };

      console.log('push data', data);

      // store push notification in firestore
      await this.dataservice
        .addForestoreNotification('d2d-app-push-notifications', data)
        .then(() => {
          this.util.presentAlertToast(
            `Notification posted successfully!`,
            'alert-circle',
            'light'
          );
          this.title = '';
          this.body = '';
          this.schedule_date_time = '';
          this.extra_key = '';
          this.extra_value = '';
          this.refreshNotifications();
        })
        .catch((error: any) => {
          this.util.presentAlertToast(
            `Notice: ${error}`,
            'alert-circle',
            'danger'
          );
        });
    } else {
      this.util.presentAlertToast(
        'Please enter a Title and Body',
        'help-circle',
        'd2dblue'
      );
    }
  }

  async updatePushPressed(id: any) {
    const alert = await this.alert.create({
      header: 'Update Notification',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title',
        },
        {
          name: 'body',
          type: 'textarea',
          placeholder: 'Body',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Update',
          handler: (data) => {
            this.updatePushNotidication(id, data.title, data.body);
            // Here you can handle the update logic, e.g., save the data
          },
        },
      ],
    });

    await alert.present();
  }

  async updatePushNotidication(docId: any, title: any, body: any) {
    await this.dataservice
      .updateFirestoreNotification(docId, title, body)
      .then(() => {
        this.setupNotificationPop();
      });
  }

  async removePushPressed(docId: any, title: any) {
    const alert = await this.alert.create({
      header: 'Remove Notification',
      message: `Would you like to remove " ${title} " from the list?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Remove',
          handler: () => {
            this.removePushNotidication(docId);
            // Here you can handle the update logic, e.g., save the data
          },
        },
      ],
    });
    await alert.present();
  }

  refreshNotifications() {
    this.show_refresh_progress = true;
    this.util.getFirestoreNotidications();
    setTimeout(() => {
      this.setupNotificationPop();
      this.show_refresh_progress = false;
    }, 5000);
  }

  async removePushNotidication(docId: any) {
    this.util.cancelLocalNotification(docId);
    await this.dataservice.removeFirestoreNotification(docId).then(() => {
      this.setupNotificationPop();
    });
  }

  ngOnInit() {
    this.setupNotificationPop();
  }
}
