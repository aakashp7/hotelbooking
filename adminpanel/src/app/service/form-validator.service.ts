import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {


  constructor() { }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
            control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {
            this.validateAllFormFields(control);
        }
        else if (control instanceof FormArray) {
            this.validateAllFormFields(control);
        }
    });
  }
}
