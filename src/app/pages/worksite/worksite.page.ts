import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var google;

@Component({
  selector: 'app-worksite',
  templateUrl: './worksite.page.html',
  styleUrls: ['./worksite.page.scss'],
})
export class WorksitePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers: any = [];  
  worksite_id = null;


  constructor(private activeRoute: ActivatedRoute,
              private plt: Platform,
              private geolocation: Geolocation) { }

  ngOnInit() {
    this.worksite_id = this.activeRoute.snapshot.paramMap.get('id');
  }

  
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
      this.map.setCenter({ lat: 37.809326, lng: -122.409981 });
      this.map.setZoom(17);

/*
      this.geolocation.getCurrentPosition().then(pos => {
        let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setCenter(latLng);
        this.map.setZoom(16);
        this.addMarker(this.map, pos.coords.latitude, pos.coords.longitude, 'You are here!');
      }).catch((error) => {
        console.log('Error getting location', error);
      });
*/
    
    });
  }
  

}
