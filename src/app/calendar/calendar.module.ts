import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CalendarModalOptions } from './calendar.model';
import { DEFAULT_CALENDAR_OPTIONS } from './services/calendar-options.provider';
import { CalendarService } from './services/calendar.service';
import { CALENDAR_COMPONENTS } from './components';


@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: CALENDAR_COMPONENTS,
  exports: CALENDAR_COMPONENTS,
  entryComponents: CALENDAR_COMPONENTS,
  providers: [
    CalendarService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarModule {
  static forRoot(defaultOptions: CalendarModalOptions = {}): ModuleWithProviders {
    return {
      ngModule: CalendarModule,
      providers: [
        { provide: DEFAULT_CALENDAR_OPTIONS, useValue: defaultOptions }
      ]
    };
  }
}
