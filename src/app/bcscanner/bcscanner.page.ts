import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
  Barcode,
} from '@capacitor-mlkit/barcode-scanning';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-bcscanner',
  templateUrl: './bcscanner.page.html',
  styleUrls: ['./bcscanner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BcscannerPage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  productData: any = [];
  constructor(
    private alertController: AlertController,
    private dataservice: DataService,
    private util: UtilService,
    private toastController: ToastController
  ) {}

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan({
      formats: [
        BarcodeFormat.QrCode,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
        BarcodeFormat.Ean13,
        BarcodeFormat.Ean8,
      ],
    });
    // check if code in list
    let filterCodes = this.barcodes.filter(
      (item: any) => item[0].rawValue === barcodes[0].rawValue
    );
    const codeValue = barcodes[0].rawValue.slice(1);
    this.dataservice
      .doProductBySKUGet(codeValue)
      .then((data: any) => {
        if (data.data && data.data.length > 0) {
          if (filterCodes?.length == 0) {
            this.productData.push(...data.data);
            this.barcodes.push(...barcodes);
          }
        } else {
          this.presentToast('No match found for item. Please try again.');
        }
      })
      .catch((e: any) => {
        console.log('d2d product error: ', e);
      });
  }

  async openScannerSettings() {
    await BarcodeScanner.openSettings();
  }

  updateCart(id: any, data: any, images?: any, quantity?: any) {
    this.util.updateCart(id, data, images, quantity);
  }

  addToShoppingList(id: any, data: any, images?: any, quantity?: any) {
    this.util.addToShoppingList(id, data, images, quantity);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: [
        {
          text: 'OPEN SETTINGS',
          role: 'confirm',
          handler: () => {
            this.openScannerSettings();
          },
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
    });
    await alert.present();
  }

  imageURL(image: any) {
    var newimg;
    let url;
    if (image || image !== undefined) {
      if (image.src) {
        url = image.src.replace('https://', '');
      } else {
        url = image.replace('https://', '');
      }
      newimg = `https://i0.wp.com/${url}`;
    } else {
      newimg = '/assets/productfiller.png';
    }
    return newimg;
  }

  async presentToast(message: any) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      icon: 'barcode-outline',
      color: 'warning',
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }
  ionViewDidEnter() {}
}
