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
  CONTRACT_ID = "0x33b8f3bdaac096179f3ee3bc7ec095187552b601078ee802375612391387cd87";
  leaseId: string = ''
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
      data: { leaseAmount: this.summary.dueAmount, landLoard: this.summary.landLoard, contractO: this.contractO, leaseId: this.leaseId }
    });
  }
  async requestRenewal(): Promise<void> {
    console.log('Lease ID entered:', this.leaseId);
    try {
      if (this.contractO != null) {
        let value = await this.contractO.functions
          .request_renew_lease(this.leaseId)
          .txParams({
            gasPrice: 1,
            gasLimit: 500_000,
          }).call()

        console.log(value)
        console.log(value.value)
        this.snackBar.open('Renewal Requested. Status : ' + value.value.requestStatus, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (_e) {
      console.log(_e)
      this.snackBar.open('Validation Error Occured. Lease May be already terminated or renewal pending', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }


  }

  async requestTermination(): Promise<void> {
    try {
      if (this.contractO != null) {
        let value = await this.contractO.functions
          .request_terminate_lease(this.leaseId)
          .txParams({
            gasPrice: 1,
            gasLimit: 500_000,
          }).call()

        this.snackBar.open('Termination Requested. Status : ' + value.value.requestStatus, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch {
      this.snackBar.open('Validation Error Occured. Lease May be already terminated or  termination request pending', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }

  }

  async onEnter(event: any) {
    if (event.key === 'Enter') {
      this.leaseId = event.target.value
      let response = await this.getLease(parseInt(event.target.value))
    }
  }

  async getLease(leaseId: number) {
    if (this.contractO != null) {
      let value = await this.contractO.functions
        .get_lease(leaseId)
        .txParams({
          gasPrice: 1,
          gasLimit: 500_000,
        }).call()

      this.summary = {
        damagedToProperty: value.value.damagedToProperty,
        dueAmount: new BN(value.value.dueAmount).toNumber(),
        evictionWarning: value.value.evictionWarning,
        id: new BN(value.value.id).toNumber(),
        illegalActivity: value.value.illegalActivity,
        leaseAmount: new BN(value.value.leaseAmount).toNumber(),
        leaseDuration: new BN(value.value.leaseDuration).toNumber(),
        leaseMaximumDue: new BN(value.value.leaseMaximumDue).toNumber(),
        leaseRenewalDate: new BN(value.value.leaseRenewalDate).toNumber(),
        landLoard: value.value.landLoard.Address?.value,
        leaseStartDate: new BN(value.value.leaseStartDate).toNumber(),
        leaseStatus: value.value.leaseStatus,
        requestStatus: value.value.requestStatus,
        secutrityDeposit: new BN(value.value.secutrityDeposit).toNumber(),
        tenant: value.value.tenant.Address?.value,
      }
      return value
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
