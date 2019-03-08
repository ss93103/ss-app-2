import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';

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

  map: any;
  worksite_id = null;
  worksiteLocations:any = [];
  Worksite:any = { latitude: 0, longitude: 0}
  User = { email: '' };
  markerArray = [];

  constructor(private activeRoute: ActivatedRoute,
              private authService: AuthService,
              private platform: Platform,
              ) { }

              
  async ngOnInit() {
    this.worksite_id = this.activeRoute.snapshot.paramMap.get('id');

    await this.platform.ready();
    await this.loadWorksite();
    await this.loadWorksiteLocations();
  }

  loadMap(lat, lng) {
    let center: ILatLng = {"lat": lat, "lng": lng};
    let radius = 400;  // radius (meter)

    // Calculate the positions
    let positions: ILatLng[] = [0, 90, 180, 270].map((degree: number) => {
      return Spherical.computeOffset(center, radius, degree);
    });

    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: positions,
        padding: 100,
        zoom: 17,
        tilt: 10
      }
    });

    let circle: Circle = this.map.addCircleSync({
      'center': center,
      'radius': radius,
      'fillOpacity': 0.75,
      'strokeColor' : '#71cce7',
      'strokeWidth': 1,
      'fillColor' : '#71cce7'
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

  addTimeClockGeoPoint() {

  }


  

}
