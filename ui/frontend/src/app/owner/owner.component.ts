import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.css'
})
export class OwnerComponent {
  isConnected = false
  noOfLeases = 0

  connectWallet() {
    this.isConnected = true
  }
  constructor(private dialog: MatDialog) { }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
    });
  }
}
