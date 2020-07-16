import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform, ModalController, AlertController } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { CalendarModalOptions, CalendarModal, CalendarResult } from '../calendar';
import { DatePipe } from '@angular/common';
import { da } from 'date-fns/locale';

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
    private datePipe: DatePipe,
    private alertController: AlertController,
    private modalController: ModalController,
    private platform: Platform) { }

  ngOnInit() { }

  async openCalendar(scan_data) {
    const options: CalendarModalOptions = {
      monthFormat: 'MMMM YYYY', // Month format for calendar component
      title: 'Select Date', // Title of the calendar component
      doneLabel: 'Done', // Title of the calendar component
      defaultDate: new Date(),
      from: new Date(),
      to: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };

    const myCalendar = await this.modalController.create({
      component: CalendarModal,
      componentProps: { options }
    });

    myCalendar.present();

    const event: any = await myCalendar.onDidDismiss();
    const date: CalendarResult = event.data;

    if (date !== null) {
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
          this.goToHome(false, true, false);
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
                      this.firestore.collection('FlightInfo').doc(doc.id).collection('Passengers').add(payload);
                      this.goToHome(true, false, false);
                    } else {
                      p.forEach(obj => {
                        if (obj.data().dept_code == payload.dept_code) {
                          if (obj.data().arr_code == payload.arr_code) {
                            if (obj.data().depart_date == payload.depart_date) {
                              if (obj.data().pass_name == payload.pass_name) {
                                if (obj.data().book_ref == payload.book_ref) {
                                  if (obj.data().eticket_ref == payload.eticket_ref) {
                                    if (obj.data().flight_no == payload.flight_no) {
                                      if (obj.data().update_date == payload.update_date) {
                                        console.log("Passenger Exist>>>>>>>");
                                        isPassenerExist = true;
                                        this.goToHome(false, false, true);
                                      }
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
                    console.log(error);
                  });
                }
              }
            }
          });

          if (!isFligthExist) {
            this.goToHome(false, true, false);
          }

          setTimeout(() => {
            if (!isPassenerExist && isFligthExist && !isPassengerEmpty) {
              console.log(docId);
              this.firestore.collection('FlightInfo').doc(docId).collection('Passengers').add(payload);
              this.goToHome(true, false, false);
            }
          }, 1000);
        }

      }, (error) => {
        console.log(error);
      });
    }
  }


  goToHome(_success, _fail, _taken) {
    //Constructing params to send next page
    let navigationExtras: NavigationExtras = {
      state: {
        meal_eligible: _success,
        meal_ineligible: _fail,
        meal_taken: _taken,
      }
    };

    //Navigate to result screen
    this.router.navigate(['home'], navigationExtras);
  }


  async openScanner() {
    let preventBack = this.platform.backButton.subscribeWithPriority(9999, () => { });

    var barcodeOptions: BarcodeScannerOptions = {
      formats: 'QR_CODE,PDF_417'
    }

    this.barCodeScanner.scan(barcodeOptions).then(data => {
      console.log("Barcode Value : ", data);
      if (data) {

        //If scan cancelled by user return with null
        if (data.cancelled) {
          return;
        }

        if (data.format != 'PDF_417') {
          this.notify('Invalid Data. Please try again!');
          return;
        }


        if (data.text) {
          if (data.text.substring(0, 2) == 'M1') {
            this.openCalendar(data.text);
          } else {
            this.notify('Invalid Data. Please try again!');
          }
        }

      }
    }).catch(err => {
      console.log("Barcode error : ", err);
    }).finally(() => {
      window.setTimeout(() => {
        preventBack.unsubscribe();
      }, 1000);
    });
  }


  async notify(msg) {
    const alert = await this.alertController.create({
      header: 'eStaff',
      message: msg,
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }
}
