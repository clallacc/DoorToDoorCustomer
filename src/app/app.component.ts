import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { UtilService } from './services/util.service';
register();

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

  constructor(private dataservice: DataService, private util: UtilService) {
    this.getProductsCategories();
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
}
