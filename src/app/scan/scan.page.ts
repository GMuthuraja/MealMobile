import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})

export class ScanPage implements OnInit {

  constructor(
    private firestore: AngularFirestore,
    private barCodeScanner: BarcodeScanner,
    private router: Router,
    private platform: Platform) { }

  ngOnInit() { }

  openScanner() {
    let preventBack = this.platform.backButton.subscribeWithPriority(9999, () => { });

    var barcodeOptions: BarcodeScannerOptions = {
      formats: 'QR_CODE,PDF_417'
    }

    this.barCodeScanner.scan(barcodeOptions).then(data => {
      console.log("Barcode Value : ", data);

      //If scan cancelled by user return with null
      if (data.cancelled) {
        return;
      }
      
      //Navigate to Success screen
      this.router.navigate(['home']);

    }).catch(err => {
      console.log("Bar code error : ", err);
    }).finally(() => {
      window.setTimeout(() => {
        preventBack.unsubscribe();
      }, 1000);
    });
  }
}
