import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Circle,
  LatLng,
  Marker,
  Spherical,
  GoogleMapsAnimation,
  MyLocation,
} from '@ionic-native/google-maps';

import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-worksite',
  templateUrl: './worksite.page.html',
  styleUrls: ['./worksite.page.scss'],
})
export class WorksitePage implements OnInit {
  @ViewChild('map_canvas') mapElement: ElementRef;

  map: GoogleMap;
  worksite_id = null;
  worksiteLocations:any = [];
  Worksite:any = { latitude: 0, longitude: 0}
  User = { email: '' };
  loading: any;
  inForm:boolean = false;

  markerArray = [];

  addForm: FormGroup;
  activeLatLng: LatLng = null;

  constructor(private activeRoute: ActivatedRoute,
              private authService: AuthService,
              public loadingCtrl: LoadingController,
              private platform: Platform,
              private formBuilder: FormBuilder,
              private alertController: AlertController
              ) { }

              
  async ngOnInit() {
    this.worksite_id = this.activeRoute.snapshot.paramMap.get('id');

    await this.platform.ready();
    await this.loadWorksite();
    await this.loadWorksiteLocations();

    this.addForm = this.formBuilder.group({
      name: ['Point #' + (this.worksiteLocations.length + 1), [Validators.required, Validators.minLength(5)]],
      range: [5, [Validators.required]]
    });
  }

  logout() {
    this.authService.logout();
  }

  clearMarkers() {
    let i = this.markerArray.length;
    while(i--) this.markerArray[i].remove();
    this.markerArray = [];
  }

  loadMap(lat, lng) {
    let center: ILatLng = { "lat": lat, "lng": lng };
    let radius = 50; 

    // Calculate the positions
    let positions: ILatLng[] = [0, 90, 180, 270].map((degree: number) => {
      return Spherical.computeOffset(center, radius, degree);
    });

    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: positions,
        padding: 10,
        zoom: 20,
        tilt: 10
      }
    });

    let circle: Circle = this.map.addCircleSync({
      'center': center,
      'radius': radius,
      'strokeColor' : '#00880050',
      'strokeWidth': 1,
      'fillColor' :  '#00880020'
    });
   
  }

  async addTimeClockGeoPoint() {
    //this.map.clear();

    this.loading = await this.loadingCtrl.create({ message: 'One moment, getting your location...' });

    await this.loading.present();

    this.map.getMyLocation().then((location: MyLocation) => {
      this.loading.dismiss();
      //console.log(JSON.stringify(location, null ,2));

      this.activeLatLng = location.latLng;

      this.map.animateCamera({
        target: location.latLng,
        zoom: 20,
        tilt: 10,
        duration: 1000
      });

      let marker: Marker = this.map.addMarkerSync({
        title: 'GPS point',
        snippet: 'A clock in/out point has been set here.',
        position: location.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });

      marker.showInfoWindow();

      this.markerArray.push(marker);
    })
    .catch(err => {
      this.loading.dismiss();
      this.showAlert(err.error_message);
    });

    this.inForm = true;
  }


  loadWorksite() {
    this.authService.getClientWorksite(this.worksite_id).subscribe(async res => {
      this.Worksite = res;

      await this.loadMap(this.Worksite.latitude, this.Worksite.longitude);
    })
  }

  loadWorksiteLocations() {
    this.authService.getWorksiteLocations(this.worksite_id).subscribe((res:any) => { 
      this.worksiteLocations = res;
      this.User = this.authService.getUser();
      this.clearMarkers();

      for(let l of res) {
        this.addMarker(l.name, 
                       'Associates can clock in through their phone app from this point.', 
                       l.latitude, l.longitude);
      }

    });  
  }

  onGPSSubmit() {
    let o = this.addForm.value;

    o.client_id = this.Worksite.cid;
    o.worksite_id = this.Worksite.id;
    o.latitude = this.activeLatLng.lat;
    o.longitude = this.activeLatLng.lng;

    console.log(o);

    this.authService.createWorksiteLocation(o)
    .subscribe(async (ret:any) => {
      if( ret.status ) {
        this.showAlert(ret.msg);

        this.addMarker('GPS Clock-in Point', 'Associates can now clock in through their phone app from this point.', o.latitude, o.longitude);

        await this.loadWorksiteLocations();
      }
      else {
        this.showAlert(ret.err);
      }
    });

    this.inForm = false;

    // todo: submit o to server
    // todo: re-size circle around GPS to match radius select

  }

  async deleteLocation(id) {
    this.authService.deleteWorksiteLocation(id)
    .subscribe(async (ret) => {
      console.log(ret)
      this.showAlert('Worksite Clock In/Out point deleted.');
      await this.loadWorksiteLocations();
    });
 
  }

  addMarker(title, text, lat, lng) {
    this.map.addMarker({
      title: title,
      snippet: text,
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: lat,
        lng: lng
     }
    })
    .then(marker => {
      this.markerArray.push(marker);

      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.showAlert('Marker Clicked');
      });

    });
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: 'Attention',
      buttons: ['OK']
    });

    alert.then(alert => alert.present());
  }


}
