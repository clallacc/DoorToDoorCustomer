import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-loginregister',
  templateUrl: './loginregister.page.html',
  styleUrls: ['./loginregister.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginregisterPage implements OnInit {
  firstname: string = '';
  lastname: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  loading: any;
  page: any;

  constructor(
    private dataservice: DataService,
    private util: UtilService,
    private loadingCtl: LoadingController,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async LoginUser() {
    this.util.loader('Login in process..');
    this.dataservice
      .doUserLogin(this.username, this.password)
      .then((data: any) => {
        if (data.data) {
          const userData = data.data;
          if (userData.data.email !== undefined) {
            this.util.setGlobalCustomerDetails(userData.data, this.password);
            // this.util.setGlobalUserData();
            this.modalCtrl.dismiss({ disabled: false });
          }
          alert(userData.message);
        } else {
          alert('Something went wrong please try again later');
        }
      });
  }

  async RegisterUser() {
    const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegExp.test(this.email)) {
      // Email is invalid
      alert('Please enter a valid email address.');
    } else {
      this.util.loader('Registering your account..');
      let data = {
        email: this.email,
        first_name: this.firstname,
        last_name: this.lastname,
        role: 'customer',
        username: this.username,
        password: this.password,
      };
      this.dataservice
        .doUserRegister(data)
        .then((data: any) => {
          const userData = data.data;
          if (data.data) {
            if (data.status === 200 || data.status === 201) {
              this.dataservice
                .doUserLogin(this.username, this.password)
                .then((data: any) => {
                  this.util.setGlobalCustomerDetails(
                    data.data.data,
                    this.password
                  );
                  // this.util.setGlobalUserData();
                  this.modalCtrl.dismiss({ disabled: false });
                  alert("You're all registered");
                });
            } else {
              alert(userData.message);
            }
          }
          this.loadingCtl.dismiss();
        })
        .catch((e) => {
          console.log(e);
          this.loadingCtl.dismiss;
        });
    }
  }

  toggleSigninRegister() {
    if (this.page === 'signin') {
      this.page = 'register';
    } else {
      this.page = 'signin';
    }
  }

  ngOnInit() {}
}
