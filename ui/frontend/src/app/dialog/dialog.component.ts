import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, CommonModule, MatDatepickerModule
  ],
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      id: ['', Validators.required],
      leaseAmount: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/)]],
      securityDeposit: [null, Validators.pattern(/^\d*\.?\d+$/)],
      leaseStartDate: [null, Validators.required],
      leaseRenewalDate: [null, Validators.required],
    });
  }

  submit() {
    if (this.form && this.form.valid) {
      // Perform form submission actions
      console.log(this.form.value);
      const leaseStartDateValue = this.form.get('leaseStartDate');
      const leaseRenewalDateValue = this.form.get('leaseRenewalDate');
      const leaseStartDateTimestamp = leaseStartDateValue ? leaseStartDateValue.value.getTime() : null;
      const leaseRenewalDateTimestamp = leaseRenewalDateValue ? leaseRenewalDateValue.value.getTime() : null;

      const date1 = new Date(leaseStartDateTimestamp);
      const date2 = new Date(leaseRenewalDateTimestamp);
      const differenceMs = Math.abs(date2.getTime() - date1.getTime());
      const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
      let agreement = {
        id: this.form.value.id,
        leaseAmount: this.form.value.leaseAmount,
        dueAmount: 0.00,
        leaseDuration: differenceDays,
        secutrityDeposit: this.form.value.securityDeposit ? this.form.value.securityDeposit : parseInt(this.form.value.leaseAmount) * 0.10,
        leaseMaximumDue: this.form.value.leaseAmount * 0.80,
        illegalActivity: false,
        damagedToProperty: false,
        leaseStartDate: leaseStartDateTimestamp,
        leaseRenewalDate: leaseRenewalDateTimestamp,
        leaseStatus: "A", // A T 
        requestStatus: "",//RR TR
        evictionWarning: ""
      }
      console.log(agreement)
      this.dialogRef.close();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
