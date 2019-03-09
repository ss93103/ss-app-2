import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Platform, AlertController } from '@ionic/angular';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentialsForm: FormGroup;
  sub = null;
  public alertShown:boolean = false;
 
  constructor(private formBuilder: FormBuilder, 
              private platform: Platform,
              private alertCtrl: AlertController,
              private authService: AuthService) { }
 
  ngOnInit() {
    this.credentialsForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
 
  onSubmit() {
    this.authService.login(this.credentialsForm.value).subscribe();
  }
 
  ionViewDidEnter() {
    this.sub = this.platform.backButton
      .subscribe(() => { 
        this.presentConfirm();
      });
  }

  ionViewWillLeave() {
    this.sub.unsubscribe();
  }

  presentConfirm() {
    let alert = this.alertCtrl.create({
      header: 'Confirm Exit',
      message: 'Do you want Exit?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.alertShown = false;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            navigator['app'].exitApp();
          }
        }
      ]
    });

    alert.then(alert => { 
      alert.present(); 
      this.alertShown = true;
    });
  }
  
 
}