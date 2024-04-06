import { CommonModule } from '@angular/common';
import { Component, Inject, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ContractAbi } from '../../contract';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent {
  contractO: ContractAbi | null = null;
  assetId = "0x0000000000000000000000000000000000000000000000000000000000000000"
  constructor(private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.contractO = data.contractO
    console.log("Contract" + this.contractO)
  }

  async submit(): Promise<void> {
    console.log('Payment Amount:', this.data.leaseAmount);
    console.log('Sender:', this.data.landLoard);
    console.log('Lease Id ' + this.data.leaseId)

    try {
      if (this.contractO != null) {
        let value = await this.contractO.functions
          .pay_leases(this.data.leaseId)
          .txParams({
            variableOutputs: 2,
            gasPrice: 1,
            gasLimit: 500_000,
          })
          .callParams({
            forward: [this.data.leaseAmount, this.assetId],
          })
          .call()

        this.snackBar.open('Transaction Id : ' + value.transactionId, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch {
      this.snackBar.open('An exception occured', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }

    this.dialogRef.close();
  }
}
