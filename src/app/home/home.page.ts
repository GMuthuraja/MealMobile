import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

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

  constructor(private navCtrl: NavController) { }

  confirmMeal() {
    alert("Meal Confirmed!");
  }

  confirmAccommodation() {
    alert("Accommodation Confirmed!");
  }

  goBack() {
    this.navCtrl.pop();
  }

}
