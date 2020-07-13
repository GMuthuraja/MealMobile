import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  mealEligible: boolean = true;
  accommodationEligible: boolean = false;
  mealInEligible: boolean = false;
  accommodationInEligible: boolean = false;

  constructor(
    private navCtrl: NavController,
    private alertController: AlertController) { }

  async confirmMeal() {
    const alert = await this.alertController.create({
      header: 'eStaff',
      message: 'Meal Confirmed!',
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }

  async confirmAccommodation() {
    const alert = await this.alertController.create({
      header: 'eStaff',
      message: 'Accommodation Confirmed!',
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }

  goBack() {
    this.navCtrl.pop();
  }

}
