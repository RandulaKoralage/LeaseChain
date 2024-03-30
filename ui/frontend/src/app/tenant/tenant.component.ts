import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Fuel, FuelWalletConnector, FuelWalletLocked } from '@fuel-wallet/sdk';
import { ContractAbi__factory, ContractAbi } from '../../contract'
import { BN, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";

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
  wallet = ""
  CONTRACT_ID = "0xd4bb67159026a58719d98b242d0321867475305b1de4f65ad9c6ca0552c5d9be";

  contractO: ContractAbi | null = null;
  fuel = new Fuel({
    connectors: [new FuelWalletConnector()],
  });


  async connectWallet() {
    await this.fuel.hasConnector();
    console.log("Connection state", await this.fuel.hasConnector());
    await this.fuel.connect();
    this.isConnected = await this.fuel.isConnected();
    console.log("Connection state", this.isConnected);

    const accounts = await this.fuel.accounts();
    console.log("Accounts", accounts);
    const currentAccount = await this.fuel.currentAccount();

    typeof (currentAccount)
    console.log(typeof (currentAccount))
    console.log("Current Account", currentAccount);
    const wallet = currentAccount != null ? await this.fuel.getWallet(currentAccount) : null
    this.contractO = connectToContract(wallet, this.CONTRACT_ID)
    console.log(this.contractO)
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

  async onEnter(event: any) {
    if (event.key === 'Enter') {
      console.log(typeof(event.target.value))
        let response = await this.getLease(parseInt(event.target.value))
        
        console.log("response"+ response)
     
    /*  this.summary = {
        damagedToProperty: false,
        dueAmount: 0,
        evictionWarning: "",
        id: "100",
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
      }*/
    }
  }

  async getLease(leaseId: number) {
    console.log(typeof(leaseId))
    if (this.contractO != null) {
      let value = await this.contractO.functions
        .get_leases(leaseId)
        .txParams({
          gasPrice: 10,
          gasLimit: 256334,
        }).call();
        console.log("value")
      console.log(value)
      return value
      // let formattedValue = new BN(value).toNumber();
      //   console.log(formattedValue)
    } else {
      return null
    }

  }
}
function connectToContract(wallet: any, CONTRACT_ID: string) {
  if (wallet) {
    const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
    return contract;
  }
  return null;
}
