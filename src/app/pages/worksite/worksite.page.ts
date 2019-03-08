import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, LoadingController } from '@ionic/angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Circle,
  CircleOptions,
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

  map: any;
  worksite_id = null;
  worksiteLocations:any = [];
  Worksite:any = { latitude: 0, longitude: 0}
  User = { email: '' };
  loading: any;
  markerArray = [];

  constructor(private activeRoute: ActivatedRoute,
              private authService: AuthService,
              public loadingCtrl: LoadingController,
              private platform: Platform,
              ) { }

              
  async ngOnInit() {
    this.worksite_id = this.activeRoute.snapshot.paramMap.get('id');

    await this.platform.ready();
    await this.loadWorksite();
    await this.loadWorksiteLocations();
  }

  loadMap(lat, lng) {
    let center: ILatLng = { "lat": lat, "lng": lng };
    let radius = 50;  // radius (meter)

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

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      this.loading.dismiss();
      //console.log(JSON.stringify(location, null ,2));

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 20,
        tilt: 10
      });

      // add a marker
      let marker: Marker = this.map.addMarkerSync({
        title: 'Clock in/out Point',
        snippet: 'A clock in/out point has been set here.',
        position: location.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });

      // show the infoWindow
      marker.showInfoWindow();

      this.markerArray.push(marker);
    })
    .catch(err => {
      this.loading.dismiss();
      //this.showToast(err.error_message);
    });
  }


  loadWorksite() {
    this.authService.getClientWorksite(this.worksite_id).subscribe(async res => {
      this.Worksite = res;
      await this.loadMap(this.Worksite.latitude, this.Worksite.longitude);
    })
  }

  loadWorksiteLocations() {
    this.authService.getWorksiteLocations(this.worksite_id).subscribe(res => { 
      this.worksiteLocations = res;
      this.User = this.authService.getUser();
    })  
  }


}
