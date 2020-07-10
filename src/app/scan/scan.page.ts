import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  constructor(private firestore: AngularFirestore) {

    let payload = {
      flight_no: '4123',
      airport_code: 'JED',
      date: '2020-06-09'
    }

    let res = {
      flight_no: '4114',
      airport_code: 'CHE',
      date: '2020-07-15'
    }

    //this.firestore.collection('FlightInfo').doc(payload.flight_no).set(payload);

    //this.firestore.doc('FlightInfo/' +payload.flight_no).update(res);

    // this.firestore.collection("FlightInfo").get().subscribe(querySnapshot => {
    //   querySnapshot.forEach(doc => {
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // });

    //this.firestore.doc('FlightInfo/' + payload.flight_no).delete();
  }

  ngOnInit() {
  }

}
