import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant.component.html',
  styleUrl: './tenant.component.css'
})
export class TenantComponent {
  isConnected = false
  summary: any = null
  connectWallet() {
    this.isConnected = true
  }
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) { }

  makePayment() {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: { leaseAmount: this.summary.leaseAmount, landLoard: this.summary.landLoard }
    });
  }
  requestRenewal(): void {
    this.snackBar.open('Renewal Requested', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }
  requestTermination(): void {
    this.snackBar.open('Termination Requested', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }
  onEnter(event: any) {
    if (event.key === 'Enter') {
      console.log(event.target.value);
      this.summary = {
        damagedToProperty: false,
        dueAmount: 0,
        evictionWarning: "",
        id: "1000",
        illegalActivity: false,
        leaseAmount: "2000",
        leaseDuration: 7,
        leaseMaximumDue: 1600,
        leaseRenewalDate: 1711737000000,
        landLoard: "0xhsjdfhs2df4fdrf45fdf2df1dfd12r4erfer",
        leaseStartDate: 1711132200000,
        leaseStatus: "A",
        requestStatus: "",
        secutrityDeposit: 200
      }
    }
  }
}
