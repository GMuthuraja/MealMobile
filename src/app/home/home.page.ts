import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { GlobalService } from '../services/global.service';
import { ScanPage } from '../scan/scan.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  mealEligible: boolean = false;
  mealInEligible: boolean = false;
  mealTaken: boolean = false;
  docId: any;
  payload: any;

  constructor(
    private navCtrl: NavController,
    private globalService: GlobalService,
    private scanPage: ScanPage,
    private firestore: AngularFirestore,
    private alertController: AlertController) { }

  ionViewWillEnter() {
    if (this.globalService.meal_eligible) {
      this.mealEligible = true;
    } if (this.globalService.meal_ineligible) {
      this.mealInEligible = true;
    } if (this.globalService.meal_taken) {
      this.mealTaken = true;
    } if (this.globalService.doc_id) {
      this.docId = this.globalService.doc_id;
    } if (this.globalService.pay_load) {
      this.payload = this.globalService.pay_load;
    }

    console.log(this.globalService.meal_eligible);
    console.log(this.globalService.meal_ineligible);
    console.log(this.globalService.meal_taken);
    console.log(this.globalService.doc_id);
    console.log(this.globalService.pay_load);
  }

  async confirmMeal() {
    const alert = await this.alertController.create({
      header: 'eStaff',
      message: 'Meal Confirmed!',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            alert.dismiss(true);
            return false;
          }
        }]
    });

    await alert.present();

    //on dismiss alert popup after press 'OK'
    await alert.onDidDismiss().then(data => {

      console.log(this.docId);
      console.log(this.payload);

      if (this.docId) {
        if (this.payload) {
          this.firestore.collection('FlightInfo').doc(this.docId).collection('Passengers').add(this.payload);
          this.navCtrl.pop();
        }
      }
    });
  }

  goBack() {
    this.navCtrl.pop();
    this.scanPage.openScanner();
  }
}
