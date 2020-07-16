import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  mealEligible: boolean = false;
  mealInEligible: boolean = false;
  mealTaken: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController) { }


  ngOnInit() {
    //Receiving params from previous page
    this.fetchRouteParams();
  }


  fetchRouteParams() {
    if (this.router.getCurrentNavigation().extras.state) {

      if (this.router.getCurrentNavigation().extras.state.meal_eligible) {
        this.mealEligible = true;
      } else if (this.router.getCurrentNavigation().extras.state.meal_ineligible) {
        this.mealInEligible = true;
      } else if (this.router.getCurrentNavigation().extras.state.meal_taken) {
        this.mealTaken = true;
      } 
    }
  }

  async confirmMeal() {
    const alert = await this.alertController.create({
      header: 'eStaff',
      message: 'Meal Confirmed!',
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }

  goBack() {
    this.navCtrl.pop();
  }

}
