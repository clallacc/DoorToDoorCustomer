import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RecipesPage implements OnInit {
  recipes: any;
  recipePage: any = 1;
  contentView: any;

  constructor(private dataservice: DataService, private util: UtilService) {}

  getRecipes() {
    this.dataservice
      .doRecipesGet(this.dataservice.global_auth.token, '20', this.recipePage)
      .then((data: any) => {
        if (data.data.length > 0) {
          this.recipes = data.data;
        }
      });
  }

  showContent(content: any) {
    this.contentView = content;
  }

  async recipeIonInfinite(ev: any) {
    this.recipePage++;
    this.dataservice
      .doRecipesGet(this.dataservice.global_auth.token, '20', this.recipePage)
      .then((data: any) => {
        if (data.data.length > 0) {
          this.recipes.push(...data.data);
        }
      });
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  imageURL(image?: any) {
    return this.util.imageURL(image);
  }

  ngOnInit() {
    this.getRecipes();
  }
}
