import { CommonModule } from '@angular/common';
import { Component, Inject, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent {
  constructor(private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  submit(): void {
    console.log('Payment Amount:', this.data.leaseAmount);
    console.log('Sender:', this.data.landLoard);
    this.dialogRef.close();
  }
}
