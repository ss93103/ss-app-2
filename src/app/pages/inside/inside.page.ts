import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, AlertController } from '@ionic/angular';
 
@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {
 
  public clientData:any = { id: 0, client_id: 0, client_name: '' };
  public clientWorksites:any = []
  public User = { email: '' };

  data = {};
 
  constructor(private authService: AuthService, 
              private storage: Storage, 
              private alertController: AlertController,
              private toastController: ToastController) { }
 
  ngOnInit() {
    this.loadClientData();
  }

  loadClientData() {
    this.authService.getClientData().subscribe(res => { 
      this.clientData = res;
      this.User = this.authService.getUser();
    })
  }

  loadClientWorksites() {
    this.authService.getClientWorksites().subscribe(res => { 
      this.clientWorksites = res;
    })
  }
 
  logout() {
    this.authService.logout();
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: 'Attention',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  // This function is for testing JWT protected route
  loadSpecialInfo() {
    this.authService.getSpecialData().subscribe(res => {
      this.data = res['msg'];
    });
  }
  
 
  // This function is for testing a removal of a JWT Token
  clearToken() {
    this.storage.remove('access_token');
 
    let toast = this.toastController.create({
      message: 'JWT removed',
      duration: 3000
    });
    toast.then(toast => toast.present());
  }
 
}