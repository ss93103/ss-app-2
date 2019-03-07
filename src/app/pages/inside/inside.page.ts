import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, AlertController, NavController, Platform, LoadingController } from '@ionic/angular';
//import { Geolocation } from '@ionic-native/geolocation/ngx';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
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
  //@ViewChild('map') mapElement: ElementRef;

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
        tilt: 30
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
        this.showToast('clicked!');
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

  /*
  ionViewDidEnter() {
    this.plt.ready().then(() => {
      let mapOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.geolocation.getCurrentPosition().then(pos => {
        let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setCenter(latLng);
        this.map.setZoom(16);
        this.addMarker(this.map, pos.coords.latitude, pos.coords.longitude, 'You are here!');
      }).catch((error) => {
        this.showAlert('Error getting location: ' + JSON.stringify(error));
      });
    
    });
  }
*/

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

      this.showAlert(JSON.stringify(res));

      let bounds = [];
      let cnt = 1;

      for(let r of this.clientWorksites) {
          let loc: ILatLng = new LatLng(r.latitude, r.longitude);

          //console.log(loc);
          bounds.push(loc);
          
          let marker: Marker = await this.map.addMarker({
            title: 'Worksite #' + cnt,
            snippet: 'Worksite info here',
            position: loc,
            animation: GoogleMapsAnimation.BOUNCE
          });

          cnt ++;

          /*

          // If clicked it, display the alert
          marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            this.showToast('clicked!');
          });


          this.markerArray.push(marker);
          */
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


 /*
  *    Google map functions - todo: update to use ionic google maps plugin
  */

  /*
  addMarker(map:any, lat:any, lng: any, marker_content:string = null) {
    let marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: { lat: lat, lng: lng }, //map.getCenter()
    });

    this.markers.push(marker);
    let content = "<p><b>Information!</b><p><p>Address, etc goes here. No big deal.</p>"; 
    this.addInfoWindow(marker, marker_content || content);
  }

  setBounds() {
    let bounds = new google.maps.LatLngBounds();
    for (var i=0; i < this.markers.length; i++) {
        bounds.extend(this.markers[i].getPosition());
    }
    this.map.fitBounds(bounds);
  }  

  addInfoWindow(marker, content){
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    onSuccess(position) {
      this.showAlert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
  };

  // onError Callback receives a PositionError object
  //
  onError(error) {
      this.showAlert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
  }

  */


  /*
  *    END Other Google map functions
  */
 
}