# Lease App Frontend and Contract Function Integration

[![Static Badge](https://img.shields.io/badge/Angular-17.3.2-3e2bcc)
](https://angular.io/guide/setup-local)
[![Static Badge](https://img.shields.io/badge/Fuels_SDK-0.73.0-c46127)
](https://docs.fuel.network/docs/fuels-ts/)
[![Static Badge](https://img.shields.io/badge/Fuel_Wallet_SDK-0.15.2-27754e)](https://wallet.fuel.network/docs/dev/getting-started/)

In this tutorial, we are focusing on integrating the sway smart contract into an Angular frontend. Other than the core libraries of Angular, we will use fuel typescript SDK and wallet SDK for this task.

## Table of Contents

- [Initiating Frontend Project](Initiating-Frontend-Project)
- [Installing Fuel Libraries](Installing-Fuel-Libraries)
    - [Generating Types from ABIs](Generating-Types-from-ABIs)
- [Connecting the Fuel Wallet to App](Connecting-the-Fuel-Wallet-to-App)
- [Accessing Contract Functions](Accessing-Contract-Functions)

## Initiating Frontend Project
The following steps are written assuming you have already installed Angular latest version on your machine. 

1. First you'll need to create a new folder inside your `LeaseChain` directory.

```sh
mkdir ui
```

2. Navigate to the `ui` folder and initiate a new angular project.
```sh
cd ui
ng new --no-standalone frontend
```
This will create a project with the standard file structure. You'll need to design a simple interface to interact with  each contract. Or else use the below repository containing the basic unintegrated UI for this tutorial.

---

💻  **GITHUB**

[Lease App Frontend](https://github.com/RandulaKoralage/LeaseChain_Frontend)

---

We will make some amendments to the above code during the integration phase.

Let's move to set up fuel-related libraries and configs with the angular project.


## Installing Fuel Libraries

1. Navigate to project folder

```tsx
cd frontend
```
2. Install npm modules

```tsx
npm i @fuel-wallet/sdk fuels
```
Check your `package.json` and you should be able to find the following imports.

```sh
"@fuel-wallet/sdk": "0.15.2",
"fuels": "0.73.0",
```
#### Generating Types from ABIs

ABI JSON facilitates connecting to an already deployed contract. Inorder to generate a typescript form of Sway ABI JSON, follow the below steps.

1. Add fuels to the project

```sh
npm add fuels
``` 
2. Navigate to `src` directory

```sh
cd src
```

3. Create `abis` directory to copy the compiled ABIs from sway project.
```sh
mkdir abis
``` 
4. Create `contract` directory to save the typescript form of ABIs
```sh
mkdir contract
``` 
5. Copy and paste all files inside your sway project `out/debug` directory to `frontend/src/abis` directory.

```sh
tree abis
├── abis
    ├── contract-abi.json
    ├── contract.bin
    └── contract-storage_slots.json
```
6. Generate types for ABIs to `contract` directory that we created at step 4

```sh
npx fuels typegen -i ./abis/*-abi.json -o ./contract

```
This will generate following output
```sh
Generating files..
 - ./contract/ContractAbi.d.ts
 - ./contract/factories/ContractAbi__factory.ts
 - ./contract/ContractAbi.hex.ts
 - ./contract/index.ts
 - contract/common.d.ts
Done.⚡
```

You can simply import the above files to your typescript code to access the contract functions.

Now we are all set to start integration. 


## Connecting the Fuel Wallet to App

App needs   to be connected to a fuel wallet in order to authorize the transactions. Under this title, we discuss how we are going to establish the wallet connection using fuel wallet SDK and fuels libraries.

Let's start with the Owner's module.

1. In `owner.component.ts` file, declare the following values for golbal scope,

```tsx
 CONTRACT_ID = "0xdxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  fuel = new Fuel({
    connectors: [new FuelWalletConnector()],
  });

```

`CONTRACT_ID` : the deployed contract ID
`fuel` : the fuel wallet connector object

2. Add the following content to `connectWallet()` function.

```tsx
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
  }
```

`fuel.hasConnector()` function checks whether any existing wallet connector available.
`fuel.connect()` will connect to the wallet and during execution, it'll open user's wallet installed as the extenstion.
`fuel.isConnected()` this will confirm whether the wallet is connected.
`fuel.accounts()` this function list down the available accounts for the wallet and `fuel.currentAccount()` function will pick the current account address used in the wallet.
`fuel.getWallet(currentAccount)` creates a wallet instance from the currentAcount we picked.

##### Connecting to the Contract

1. Declare a `ContractAbi` object in gloable scope.

```tsx
 contractO: ContractAbi | null = null;
```
2. Use `connectToContract` function to establish the connection with the contract. 
```tsx
    this.contractO = connectToContract(wallet, this.CONTRACT_ID)
    console.log(this.contractO)
```

Here I have set the contract instance to `contractO` so that I can use it anywhere over the file.


## Accessing Contract Functions

Now we are going to create a new lease contract. 

**1. add_lease**

First we will extract the data captured by text fields and later will send it to `add_lease` function as a an Lease Agreeement object.

`dialog.component.ts`
```tsx
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
  ```

  In our smart contract, we expected tenant address to be in `Identity` type. To convert the `string` types tenant's address you can use following format.

  ```tsx
   { Address: { value: new Address(tenant).toB256() } } 
  ```

  value of `tenant` we input is something like `fuel1rs25xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Also, the returned leaseId is taken and displayed to front user.

**2. get_lease**
  
  This function call to simply fetch the lease by it's id. Once the lease id is given, it'll fetch the lease details and display them in an readable manner.

`payment-dialog.component.ts`
  ```tsx
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
  ```
  
**3. request_renew_lease**

Once the lease data is displayed, the tenant is allowed to pay the lease, request to renew it or terminate the lease. The request is recorded in the contract.

`payment-dialog.component.ts`
```tsx
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

```
With a similar approach, you can call the `request_terminate_lease` contract function as well.

**4. pay_leases**

To implement `pay_leases` function, you'll need to pass the amount to transfer and the asset Id under,

```tsx
.callParams({
          forward: [this.data.leaseAmount, this.assetId],
        })
```

We only pass the lease id from frontend and the contract will pick the associated `landLoard` of the lease. Also contract will restrict paying unrelated leases to tenant.

`payment-dialog.component.ts`
```tsx
 async submit(): Promise<void> {
    console.log('Payment Amount:', this.data.leaseAmount);
    console.log('Sender:', this.data.landLoard);
    console.log('Lease Id ' + this.data.leaseId)
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
    this.dialogRef.close();
  }
```
The Readme contains only a few details on the integration, hence kindly refer to the frontend project available in GitHub repository.

## Start the Angular Application

To deploy this project locally run

```bash
  ng s
```
If you are using the default angular post, you should be able to access the frontend from,

```tsx
https://localhost:4200/
```
---

Hope you find this tutorial useful. Thanks for reading 🙌
