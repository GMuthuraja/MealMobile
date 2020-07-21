import { Component } from '@angular/core';
import { AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { DatePipe } from '@angular/common';
import { CalendarModalOptions, CalendarModal, CalendarResult } from '../calendar';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  mealEligible: any;
  mealInEligible: any;
  mealTaken: any;
  docId: any;
  payload: any;

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private barCodeScanner: BarcodeScanner,
    private datePipe: DatePipe,
    private loadingController: LoadingController,
    private modalController: ModalController) {
    this.initializeApp();
  }

  initializeApp() {
    setTimeout(() => {
      this.initialize();
      this.openScanner();
    }, 1000);
  }

  initialize() {
    this.mealEligible = false;
    this.mealInEligible = false;
    this.mealTaken = false;
    this.docId = '';
    this.payload = '';
  }

  async openScanner() {
    this.showLoader('Please wait..');
    var barcodeOptions: BarcodeScannerOptions = {
      formats: 'QR_CODE,PDF_417'

    }

    this.barCodeScanner.scan(barcodeOptions).then(data => {
      console.log("Barcode Value : ", data);

      if (data.cancelled) {
        this.hideLoader();
        this.initializeApp();
        return;
      }

      if (data) {
        if (data.text) {
          if (data.text.substring(0, 2) == 'M1') {

            setTimeout(() => {
              this.hideLoader();
            }, 1000);

            this.openCalendar(data.text);
          } else {
            this.hideLoader();
            this.notifyCallBack('Invalid. Please try again!');
          }
        }
      }
    }).catch(err => {
      console.log("Barcode error : ", err);
      this.hideLoader();
      navigator['app'].exitApp();
    });
  }

  async openCalendar(scan_data) {
    var today = new Date();

    var tomorrow = new Date();
    var numberOfDaysToAdd = 1;
    tomorrow.setDate(tomorrow.getDate() + numberOfDaysToAdd);

    console.log(tomorrow);

    const options: CalendarModalOptions = {
      monthFormat: 'MMMM YYYY', // Month format for calendar component
      title: 'Select Date', // Title of the calendar component
      doneLabel: 'Done', // Title of the calendar component
      defaultDate: new Date(),
      from: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      to: tomorrow
    };

    const myCalendar = await this.modalController.create({
      component: CalendarModal,
      componentProps: { options }
    });

    myCalendar.present();

    const event: any = await myCalendar.onDidDismiss();
    const date: CalendarResult = event.data;

    console.log(date);

    if (date) {
      this.showLoader('Please wait..');
      let scanData = scan_data?.replace(/ +/g, ' ');
      let firstName = scanData?.substring(scanData.indexOf('/') + 1, scanData.indexOf(' '));
      let lastName = scanData?.substring(2, scanData?.indexOf('/'));
      let fullName = firstName + ' ' + lastName;
      let bookingRef = scanData?.split(' ')[1].substring(1).trim();
      let departureCode = scanData?.split(' ')[2].substring(0, 3).trim();
      let arrivalCode = scanData?.split(' ')[2].substring(3, 6).trim();
      let flightNum = scanData?.split(' ')[3].trim();
      let eTicketNum = scanData?.substring(scanData?.lastIndexOf('065'), scanData?.lastIndexOf('SV')).trim();

      let payload = {
        pass_name: fullName,
        book_ref: bookingRef,
        dept_code: departureCode,
        arr_code: arrivalCode,
        flight_no: flightNum,
        eticket_ref: eTicketNum,
        depart_date: this.datePipe.transform(date.dateObj, 'yyyy-MM-dd'),
        update_date: this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      }

      console.log(date.dateObj);
      console.log(scanData);
      console.log(payload);

      this.firestore.collection("FlightInfo").get().subscribe(q => {
        if (q.empty) {
          console.log("FlightInfo>>>>>>>no collection");
          this.goToHome(false, true, false, null, null);
        } else {
          let isFligthExist = false;
          let isPassenerExist = false;
          let isPassengerEmpty = false;
          let docId;
          q.forEach(doc => {
            if (doc.data().dept_code == payload.dept_code) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  docId = doc.id;
                  console.log("Flight Exist>>>>>>> " + docId);
                  this.firestore.collection('FlightInfo').doc(docId).collection('Passengers').get().subscribe(p => {
                    if (p.empty) {
                      isPassengerEmpty = true;
                      console.log("{Passenger>>>>>>>no collection");
                      this.goToHome(true, false, false, payload, docId);
                    } else {
                      p.forEach(obj => {
                        if (obj.data().dept_code == payload.dept_code) {
                          if (obj.data().arr_code == payload.arr_code) {
                            if (obj.data().depart_date == payload.depart_date) {
                              if (obj.data().pass_name == payload.pass_name) {
                                if (obj.data().book_ref == payload.book_ref) {
                                  if (obj.data().eticket_ref == payload.eticket_ref) {
                                    if (obj.data().flight_no == payload.flight_no) {
                                      console.log("Passenger Exist>>>>>>>");
                                      isPassenerExist = true;
                                      this.goToHome(false, false, true, null, null);
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      });
                    }
                  }, (error) => {
                    this.hideLoader();
                    console.log(error);
                  });
                }
              }
            }
          });

          if (!isFligthExist) {
            this.goToHome(false, true, false, null, null);
          }

          setTimeout(() => {
            if (!isPassenerExist && isFligthExist && !isPassengerEmpty) {
              console.log(docId);
              this.goToHome(true, false, false, payload, docId);
            }
          }, 1000);
        }

      }, (error) => {
        this.hideLoader();
        console.log(error);
      });
    } else {
      this.initializeApp();
    }
  }


  goToHome(_success, _fail, _taken, _payload, _id) {
    this.mealEligible = _success;
    this.mealInEligible = _fail;
    this.mealTaken = _taken;
    this.payload = _payload;
    this.docId = _id;

    setTimeout(() => {
      this.hideLoader();
    }, 1000);
  }

  async notify(msg) {
    const alert = await this.alertController.create({
      header: 'Saudia Meal',
      message: msg,
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }


  async notifyCallBack(msg) {
    const alert = await this.alertController.create({
      header: 'Saudia Meal',
      message: msg,
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
      this.initializeApp();
    });
  }

  async confirmMeal() {
    console.log(this.docId);
    console.log(this.payload);

    if (this.docId) {
      if (this.payload) {
        this.firestore.collection('FlightInfo').doc(this.docId).collection('Passengers').add(this.payload);
      }
    }

    const alert = await this.alertController.create({
      header: 'Saudia Meal',
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
      this.initializeApp();
    });
  }


  //show the loading bar
  showLoader(msg) {
    return this.loadingController.create({
      message: msg,
      backdropDismiss: false,
      showBackdrop: true
    }).then(loader => {
      loader.present();
    });
  }

  //hide the loading bar
  hideLoader() {
    return this.loadingController.dismiss();
  }
}
