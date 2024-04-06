import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Fuel, FuelWalletConnector, FuelWalletLocked } from '@fuel-wallet/sdk';
import { ContractAbi__factory, ContractAbi } from '../../contract'

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
  CONTRACT_ID = "0x33b8f3bdaac096179f3ee3bc7ec095187552b601078ee802375612391387cd87";
  currentAcc = ""
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
    this.currentAcc = currentAccount ? currentAccount : ""
    console.log("Current Account", currentAccount);
    const wallet = currentAccount != null ? await this.fuel.getWallet(currentAccount) : null

    this.contractO = connectToContract(wallet, this.CONTRACT_ID)
    console.log(this.contractO)
  }

  constructor(private dialog: MatDialog) { }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { contractO: this.contractO ,landLoard : this.currentAcc }
    });
  }
}
function connectToContract(wallet: any, CONTRACT_ID: string) {
  if (wallet) {
    const contract = ContractAbi__factory.connect(CONTRACT_ID, wallet);
    return contract;
  }
  return null;
}