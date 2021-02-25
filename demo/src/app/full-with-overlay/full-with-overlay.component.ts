import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocaleConfig } from '../../../../src/daterangepicker';

@Component({
  selector: 'full-with-overlay',
  templateUrl: './full-with-overlay.component.html'
})
export class FullWithOverlay {
  title = "Daterangepicker using angular's CDK Overlay";
//   form: FormGroup;
//   form2: FormGroup;
//   minDate: moment.Moment = moment().subtract(5, 'days');
//   maxDate: moment.Moment = moment().add(2, 'month');
//   locale: any = {
//     format: 'YYYY-MM-DDTHH:mm:ss.SSSSZ',
//     displayFormat: 'DD MMMM YYYY HH:mm',
//     separator: ' To ',
//     cancelLabel: 'Cancel',
//     applyLabel: 'Okay'
//   }

//   constructor(private fb: FormBuilder) {
//     this.form = this.fb.group({
//       selected: [{
//         startDate: moment('2015-11-24T00:00Z'),
//         endDate: moment('2015-11-26T00:00Z')
//       }, Validators.required],
//     });

//     this.form2 = this.fb.group({
//       selected: [{
//         startDate: '2019-12-11T18:30:00.000Z',
//         endDate: '2019-12-12T18:29:59.000Z',
//       }, Validators.required],
//     });
//    }

//   submit() {
//     console.log(this.form.value);
//   }

//   submit2() {
//     console.log(this.form2.value);
//   }
//   toggleDisable(form: FormGroup) {
//     if (form.disabled) {
//       form.enable();
//     } else {
//       form.disable();
//     }
//   }
  options: any = {
    ngxOverlay: false,
    autoApply: false,
    alwaysShowCalendars: false,
    showCancel: false,
    showClearButton: false,
    linkedCalendars: true,
    singleDatePicker: false,
    showWeekNumbers: false,
    showISOWeekNumbers: false,
    customRangeDirection: false,
    lockStartDate: false,
    closeOnAutoApply: true
  };
  minDate: moment.Moment = moment().subtract(5, 'days');
  maxDate: moment.Moment = moment().add(2, 'month');
  locale: any = {
    format: 'YYYY-MM-DDTHH:mm:ss.SSSSZ',
    displayFormat: 'DD MMMM YYYY HH:mm',
    separator: ' To ',
    cancelLabel: 'Cancel',
    applyLabel: 'Okay'
  }
  opens: string;
  drops: string;
  timePicker: boolean;
  dateLimit: number;
  click() {
  }
  selected = {start: moment().subtract(3, 'days'), end: moment().add(3, 'days') };
  constructor() {
    this.timePicker = false;
    this.opens = 'right';
    this.drops = 'down';
    this.dateLimit = 30;
  }

  clear(): void {
  }
  ngOnInit() {
  }

  eventClicked(e): void {
    console.log({'eventClicked()': e});
  }
}
