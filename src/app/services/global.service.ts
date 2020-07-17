import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {

  meal_eligible: any;
  meal_ineligible: any;
  meal_taken: any;
  pay_load: any;
  doc_id: any;

  constructor() { }
}
