# Contract for Lease Management Application
[![MIT License](https://img.shields.io/badge/Sway-3ec734.svg)](https://docs.fuel.network/docs/sway/) [![Static Badge](https://img.shields.io/badge/Fuels-8741cc)](https://docs.fuel.network/docs/intro/what-is-fuel/)

## Table of Contents

- [Prerequisites](Prerequisites)
- [Structuring the Contract](Structuring-the-Contract)
- [Application Binary Interface (ABI)](Application-Binary-Interface-(ABI))
- [Developing Contract](Developing-Contract)
- [Deploying Contract](Deploying-Contract)

## Prerequisites

#### Tools Check List
1. You'll need to use a Linux Operating System or Windows Linux Subsystem (WLS) installed on your Windows Operating System in order to run fuels toolchain.
2. Make sure you have installed `fuelup`

```tsx
 fuelup --version
```
---

📝 **NOTE**

 How to install fuel toolchain [guide](https://docs.fuel.network/guides/installation/)

---

3. Confirm whether Node and Angular Installed on your development environment
```tsx
node --version
ng --version
```
---

📝 **NOTE**

 How to install [Node](https://angular.io/guide/setup-local) and [Angular](https://angular.io/guide/setup-local)

---

#### Initiate the project

1. Create a fresh folder inside your working directory
```tsx
 mkdir LeaseChain
```
2. Start the new project inside the above-created folder. I use name `contract` as the project name since I am going to write the contract inside it.
```tsx
cd LeaseChain
forc new contract
```
3. Confirm your project structure
```tsx
tree contract

├── Forc.toml
└── src
    └── main.sw
```

---

📝 **NOTE**

 `Forc.toml` is the manifest file and `main.sw` is where we going to write the contract. It autogenerates with `forc new` command with `.sw` extension stands for sway.

---

4. Open the code from VS code inorder to make the development easy.

Let's move to smart contract development.


## Structuring the Contract

Let's try to structure our contract definition first.

The very first line of the file should mention the Sway Program Type. It can be either `contarct;` `library;` `predicate;` or `script;` 

On the top we will mention the program type as `contarct;` as we are going to write a contract to manage a lease agreement.

```tsx
contarct;
```

Then let's do all the imports of methods and types from The Sway standard library.

```tsx

use std::{
    asset::transfer,
    auth::msg_sender,
    call_frames::msg_asset_id,
    constants::BASE_ASSET_ID,
    context::{
        msg_amount,
        this_balance,
    },
    hash::Hash,
};
```


Thirdly we will declare the data validation errors. Here we will use Enumerations (Enums) which can use to declare multiple variations for a given type.
 
```tsx
enum InvalidError {
    IncorrectAssetId: AssetId,
    OnlyLandOwner: Identity,
    OnlyTenant: Identity,
    LeaseIsNotActive: u8, //1
    RequestPending: u8, // RR:2 TR:3
    NoDueAmount: u64,
}
```
Then let's define the Lease Agreement structure. With this, we will declare the object structure of a lease with its properties. To do this let's use `struct` keyword available in sway language.

```tsx
struct LeaseAgreement {
    id: u64,
    leaseAmount: u64,
    dueAmount: u64,
    leaseDuration: u32,
    secutrityDeposit: u64,
    leaseMaximumDue: u64,
    illegalActivity: bool,
    damagedToProperty: bool,
    leaseStartDate: u64,
    leaseRenewalDate: u64,
    landLoard: Identity,
    tenant: Identity,
    leaseStatus: str[1], // A T 
    requestStatus: str[2], //RR TR
    evictionWarning: bool,
}
```
---

📝 **NOTE**

 Checkout [here](https://fuellabs.github.io/sway/v0.19.2/basics/built_in_types.html) for more details about built-in data types

---

As my plan to store the lease objects inside a `StorageMap`, it needed to declare some persistent storage to store data. `StorageMap` is a collection type of sway language.

```tsx
storage {
    // counter for total leases listed
    lease_counter: u64 = 0,
    // map of lease IDs to leases
    lease_map: StorageMap<u64, LeaseAgreement> = StorageMap {},
}
```
Next, let's move to defining the ABI (Application Binary Interface)


## Application Binary Interface (ABI)

Here we will define the function structure for the application. The concept of ABI is somewhat similar to defining interfaces in Java or JavaScript. Here we can declare the functions, their return types, parameter types, storage access, and playability. 

```tsx
abi LeaseHandler {
    //Land load can create a lease agreement
    #[storage(read, write)]
    fn add_lease(agreement: LeaseAgreement) -> u64;

    #[storage(read)]
    fn get_lease(lease_id: u64) -> LeaseAgreement;

    // return the number of leases listed
    #[storage(read)]
    fn get_count() -> u64;

    //Pay lease amount
    #[storage(read, write), payable]
    fn pay_leases(lease_id: u64);

    //Request renew contract request
    #[storage(read, write)]
    fn request_renew_lease(lease_id: u64) -> LeaseAgreement;

    //Request terminate contract request
    #[storage(read, write)]
    fn request_terminate_lease(lease_id: u64) -> LeaseAgreement;

    //Renew contract approve
    #[storage(read, write)]
    fn approve_renew_lease(lease_id: u64) -> LeaseAgreement;

    //Terminate contract approve
    #[storage(read, write)]
    fn approve_terminate_lease(lease_id: u64) -> LeaseAgreement;
}
```


##  Developing Contract


Now let's implement the contract functions based on the ABI written.

**1. Add Lease**

This function is to create and store a lease agreement. 

```tsx
 //Land load can create a lease agreement
    #[storage(read, write)]
    fn add_lease(agreement: LeaseAgreement) -> u64 {
        storage
            .lease_counter
            .write(storage.lease_counter.try_read().unwrap() + 1);

        // get the message sender
        let sender = msg_sender().unwrap();

        // configure the lease
        let durationInMonths = agreement.leaseDuration / 30;
        let new_lease: LeaseAgreement = LeaseAgreement {
            id: storage.lease_counter.try_read().unwrap(),
            leaseAmount: agreement.leaseAmount,
            dueAmount: agreement.leaseAmount * durationInMonths,
            leaseDuration: agreement.leaseDuration,
            secutrityDeposit: agreement.secutrityDeposit,
            leaseMaximumDue: 30,
            illegalActivity: false,
            damagedToProperty: false,
            leaseStartDate: agreement.leaseStartDate,
            leaseRenewalDate: agreement.leaseRenewalDate,
            landLoard: sender,
            tenant: agreement.tenant,
            leaseStatus: __to_str_array("A"), // A T 
            requestStatus: __to_str_array("RA"), //RR TR
            evictionWarning: false,
        };

        // save the new lease to storage using the counter value
        storage
            .lease_map
            .insert(storage.lease_counter.try_read().unwrap(), new_lease);
        return storage.lease_counter.try_read().unwrap();
    }

```
The function will receive a Lease Agreement structure as the parameter and based on that it'll create a new Lease Agreement and store it in the Storage Map.

Here you'll notice the following syntax,
```tsx
 __to_str_array("A")
```
As the data type for ` leaseStatus: str[1]` is an array, it'll need to convert the `string` value to an array using `__to_str_array` function.

**2. Get Lease**

```tsx
   #[storage(read)]
    fn get_lease(lease_id: u64) -> LeaseAgreement {
        return storage.lease_map.get(lease_id).try_read().unwrap();
    }
```
This function will read the Storage Map and return the lease object based on the id value.

**3. Pay Lease**
```tsx
    //Pay lease amount
    #[storage(read, write), payable]
    fn pay_leases(lease_id: u64) {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        let asset_id = msg_asset_id();

        let dueAmount = lease_agreement.dueAmount;
        let payment = msg_amount();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive(1),
        );
        require(dueAmount > 0, InvalidError::NoDueAmount(dueAmount));
        require(
            asset_id == BASE_ASSET_ID,
            InvalidError::IncorrectAssetId(asset_id),
        );
        let balance = lease_agreement.dueAmount - payment;
        lease_agreement.dueAmount = balance;
        storage.lease_map.insert(lease_id, lease_agreement);

        transfer(lease_agreement.landLoard, asset_id, payment);
    }
```
Tenant can pay the lease amount using this function.

You can see some conditions declared as below,
```tsx
require(dueAmount > 0, InvalidError::NoDueAmount(dueAmount));
```

```tsx
 require(
            asset_id == BASE_ASSET_ID,
            InvalidError::IncorrectAssetId(asset_id),
        );
```
The first parameter represent the condition and if it fails the right hand parameter is the output. As you see `InvalidError` is the `Enum` we declared at the beginning

**4. Request to Renew a Lease**

```tsx
    //Request renew contract request
    #[storage(read, write)]
    fn request_renew_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        let sender = msg_sender().unwrap();
        require(
            sender == lease_agreement
                .tenant,
            InvalidError::OnlyTenant(sender),
        );
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive(1),
        );
        require(
            from_str_array(lease_agreement.requestStatus) != "RR",
            InvalidError::RequestPending(2),
        );
        lease_agreement.requestStatus = __to_str_array("RR");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }
```
This function will set the `requestStatus` function value to `RR`, which represents a `Renewal Request`

**4. Request to Terminate a Lease**

```tsx
  //Request terminate contract request
    #[storage(read, write)]
    fn request_terminate_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        let sender = msg_sender().unwrap();
        require(
            sender == lease_agreement
                .tenant,
            InvalidError::OnlyTenant(sender),
        );
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive(1),
        );
        require(
            from_str_array(lease_agreement.requestStatus) != "TR",
            InvalidError::RequestPending(3),
        );
        lease_agreement.requestStatus = __to_str_array("TR");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }
```
As same as renewal function, this function sets `requestStatus` to `TR` status which implies Termination Requested.

With the next step, let's try to build and deploy the contract to testnet.


## Deploying Contract

In this step, we will build and deploy our newly developed smart contract to fuel testnet.

1. Navigate to the `src` folder.

```sh
cd src
```

2. Format the code to get cleaner content.

```sh
forc fmt
```

3. Build the contract.

```sh
forc build
```

During the build, you may able to find the possible syntax and type errors of your code. If it is built successfully, it's more likely your smart contract will work fine.

You can find the output files inside `out` directory which located as the same level as `src` directory.

```sh
├── debug
    ├── contract-abi.json
    ├── contract.bin
    └── contract-storage_slots.json
```

4. Deploy the contract

```sh
forc deploy --testnet
```

It outputs your contract address and you can copy the address to use to access the contract from the frontend.

---

📝 **NOTE**

Pleasee refer [this](https://docs.fuel.network/guides/quickstart/building-a-smart-contract/#deploy-the-contract) guide on how to deploy a contract to fuel blockchain.

---
This will also store the deployment details as a JSON file inside `out/deployments` directory.

Now we are ready to integrate this contract with a frontend 👏 
