import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, AlertController, NavController, Platform, LoadingController } from '@ionic/angular';
//import { Geolocation } from '@ionic-native/geolocation/ngx';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
} from '@ionic-native/google-maps';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {
  @ViewChild('map_canvas') mapElement: ElementRef;

  map: GoogleMap;
  loading: any;
  markerArray = [];

  public clientData:any = { id: 0, client_id: 0, client_name: '' };
  public clientWorksites:any = []
  public User = { email: '' };

  data = {};
 
  constructor(private authService: AuthService, 
              public loadingCtrl: LoadingController,
              private storage: Storage, 
              public navCtrl: NavController, 
              private platform: Platform, 
              private alertController: AlertController,
              private toastController: ToastController) { }
 
  async ngOnInit() {
    await this.platform.ready();

    if( this.markerArray == undefined ) this.markerArray = [];

    this.loadClientData();

    await this.loadMap();
  }

  loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: {
          lat: 43.0741704,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 10
      }
    });
   
  }

  async onButtonClick() {
    this.map.clear();

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });

    await this.loading.present();

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      this.loading.dismiss();
      //console.log(JSON.stringify(location, null ,2));

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 17,
        tilt: 30
      });

      // add a marker
      let marker: Marker = this.map.addMarkerSync({
        title: 'Hello!',
        snippet: 'You are here...',
        position: location.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });

      // show the infoWindow
      marker.showInfoWindow();

      // If clicked it, display the alert
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.showAlert('You are here!');
      });

      this.markerArray.push(marker);
    })
    .catch(err => {
      this.loading.dismiss();
      this.showToast(err.error_message);
    });
  }

  async showToast(message: string) {
    let toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    toast.present();
  }

  editWorksite(id) {
    this.navCtrl.navigateForward(`/worksite/${id}`);
  }


  clearMarkers() {
    let i = this.markerArray.length;
    while(i--) this.markerArray[i].remove();
    this.markerArray = [];
  }

  setBounds() {
    if( this.markerArray && this.markerArray.length )
    this.map.animateCamera({
      target: this.markerArray
    });
  }  

  loadClientData() {
    this.authService.getClientData().subscribe(res => { 
      this.clientData = res;
      this.User = this.authService.getUser();
    })
  }

  async loadClientWorksites() {
    this.clearMarkers();

    this.authService.getClientWorksites().subscribe(async (res) => { 
      this.clientWorksites = res;

      let bounds = [];
      let cnt = 1;

      for(let r of this.clientWorksites) {
          let loc: LatLng = new LatLng(r.latitude, r.longitude);

          bounds.push(loc);

          this.map.addMarker({
            title: 'Worksite #' + cnt,
            snippet: 'Worksite info here...Add some lines...',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: r.latitude,
              lng: r.longitude
           }
          })
          .then(marker => {
            this.markerArray.push(marker);

            marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
              this.showAlert('Marker Clicked');
            });
          });

          cnt ++;

      }

      if( bounds && bounds.length > 0 ) this.map.animateCamera({ target: bounds }); // resize map to show all markers
      
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