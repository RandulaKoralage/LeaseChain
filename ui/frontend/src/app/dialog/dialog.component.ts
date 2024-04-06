import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ContractAbi } from '../../contract';
import { IdentityInput } from '../../contract/ContractAbi';
import { Address, BN, BaseAssetId } from 'fuels';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  contractO: ContractAbi | null = null;
  tenant: IdentityInput = {
    Address: {
      value: "",
    },
  }
  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      leaseAmount: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/)]],
      securityDeposit: [null, Validators.pattern(/^\d*\.?\d+$/)],
      tenant: [null, Validators.required],
      leaseStartDate: [null, Validators.required],
      leaseRenewalDate: [null, Validators.required],
    });
    this.contractO = data.contractO
    console.log("Contract" + this.contractO)
  }
  async submit() {
    if (this.form && this.form.valid) {
      /*Preparing data inputs*/
      const tenant = this.form.value.tenant;
      this.tenant = tenant ? { Address: { value: new Address(tenant).toB256() }, } : { Address: { value: "", } };
      const leaseStartDateValue = this.form.get('leaseStartDate');
      const leaseRenewalDateValue = this.form.get('leaseRenewalDate');
      const leaseStartDateTimestamp = leaseStartDateValue ? leaseStartDateValue.value.getTime() : null;
      const leaseRenewalDateTimestamp = leaseRenewalDateValue ? leaseRenewalDateValue.value.getTime() : null;

      const date1 = new Date(leaseStartDateTimestamp);
      const date2 = new Date(leaseRenewalDateTimestamp);
      const differenceMs = Math.abs(date2.getTime() - date1.getTime());
      const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

      /*Setting up Agreement Object in a way that fits with LeaseAgreement struct of contract*/
      let agreement = {
        id: 1,
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
        requestStatus: "RA",//RR TR
        evictionWarning: false,
        landLoard: tenant ? { Address: { value: new Address(this.data.landLoard).toB256() }, } : { Address: { value: "", } },
        tenant: this.tenant
      }

      /*Calling the contract function*/
      try {
        if (this.contractO != null) {
          let value = await this.contractO.functions
            .add_lease(agreement)
            .txParams({
              gasPrice: 1,
              gasLimit: 500_000,
            }).call()
          let formattedValue = new BN(value.value).toNumber();
          console.log(formattedValue)
          this.snackBar.open('Lease ID : ' + formattedValue, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          })
        }
      } catch {
        this.snackBar.open('Error Occured', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        })
      }


      this.dialogRef.close();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
