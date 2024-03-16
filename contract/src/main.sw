contract;

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

enum InvalidError {
    IncorrectAssetId: AssetId,
    NotEnoughTokens: u64,
    OnlyLandOwner: Identity,
    LeaseIsNotActive: str,
    RequestPending: str,
    NoDueAmount: u64,
}

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

storage {
    // map of Lease IDs to Lease
    lease_map: StorageMap<u64, LeaseAgreement> = StorageMap {},
    // owner of the contract
    owner: Option<Identity> = Option::None,
}

abi LeaseHandler {
    //Land load can create a lease agreement
    #[storage(read, write)]
    fn add_lease(agreement: LeaseAgreement);

    //Tenent can search for his lease based on Lease ID
    #[storage(read)]
    fn get_leases(lease_id: u64) -> LeaseAgreement;

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

    // Set the contract owner
    #[storage(read, write)]
    fn initialize_owner() -> Identity;

    // Collect lease
    #[storage(read)]
    fn withdraw_lease_funds();
}

impl LeaseHandler for Contract {
    //Land load can create a lease agreement
    #[storage(read, write)]
    fn add_lease(agreement: LeaseAgreement) {
        let sender = msg_sender().unwrap();

        // configure the item
        let new_agreement: LeaseAgreement = LeaseAgreement {
            id: agreement.id,
            leaseAmount: agreement.leaseAmount,
            dueAmount: 0,
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

        // save the new item to storage using the counter value
        storage.lease_map.insert(agreement.id, new_agreement);
    }

    //Tenent can search for his lease based on Lease ID
    #[storage(read)]
    fn get_leases(lease_id: u64) -> LeaseAgreement {
        return storage.lease_map.get(lease_id).try_read().unwrap();
    }

    //Pay lease amount
    #[storage(read, write), payable]
    fn pay_leases(lease_id: u64) {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        let asset_id = msg_asset_id();

        let dueAmount = lease_agreement.dueAmount;
        let payment = msg_amount();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive("Lease is Already in Terminate Status"),
        );
        require(dueAmount > 0, InvalidError::NoDueAmount(dueAmount));
        require(
            payment >= lease_agreement
                .dueAmount,
            InvalidError::NotEnoughTokens(payment),
        );
        require(
            asset_id == BASE_ASSET_ID,
            InvalidError::IncorrectAssetId(asset_id),
        );
        lease_agreement.dueAmount = lease_agreement.dueAmount - payment;
        storage.lease_map.insert(lease_id, lease_agreement);

        transfer(lease_agreement.landLoard, asset_id, payment);
    }

    //Request renew contract request
    #[storage(read, write)]
    fn request_renew_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive("Lease is Already in Terminate Status"),
        );
        require(
            from_str_array(lease_agreement.requestStatus) != "RR",
            InvalidError::RequestPending("Pending Renewal Request Available"),
        );
        lease_agreement.requestStatus = __to_str_array("RR");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }

    //Request terminate contract request
    #[storage(read, write)]
    fn request_terminate_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive("Lease is Already in Terminate Status"),
        );
        require(
            from_str_array(lease_agreement.requestStatus) != "TR",
            InvalidError::RequestPending("Pending Termination Request Available"),
        );
        lease_agreement.requestStatus = __to_str_array("TR");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }

    //Renew contract approve
    #[storage(read, write)]
    fn approve_renew_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive("Lease is Already in Terminate Status"),
        );
        require(
            from_str_array(lease_agreement.requestStatus) == "RR",
            InvalidError::RequestPending("No Renewal Request Available"),
        );
        lease_agreement.requestStatus = __to_str_array("RA");
        // lease_agreement.leaseRenewalDate = "RA"
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }

    //Terminate contract approve
    #[storage(read, write)]
    fn approve_terminate_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive("Lease is Already in Terminate Status"),
        );
        require(
            from_str_array(lease_agreement.requestStatus) == "TR",
            InvalidError::RequestPending("No Renewal Request Available"),
        );
        lease_agreement.requestStatus = __to_str_array("TA");
        lease_agreement.leaseStatus = __to_str_array("A");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
    }

    // Set the contract owner
    #[storage(read, write)]
    fn initialize_owner() -> Identity {
        let owner = storage.owner.try_read().unwrap();

        // make sure the owner has NOT already been initialized
        require(owner.is_none(), "owner already initialized");

        // get the identity of the sender        
        let sender = msg_sender().unwrap();
        // set the owner to the sender's identity
        storage.owner.write(Option::Some(sender));

        // return the owner
        return sender;
    }

    // Collect lease
    #[storage(read)]
    fn withdraw_lease_funds() {
        let owner = storage.owner.try_read().unwrap();

        // make sure the owner has been initialized
        require(owner.is_some(), "owner not initialized");

        let sender = msg_sender().unwrap();
        // require the sender to be the owner
        require(
            sender == owner
                .unwrap(),
            InvalidError::OnlyLandOwner(sender),
        );

        // get the current balance of this contract for the base asset
        let amount = this_balance(BASE_ASSET_ID);

        // require the contract balance to be more than 0
        require(amount > 0, InvalidError::NotEnoughTokens(amount));

        // send the amount to the owner
        transfer(owner.unwrap(), BASE_ASSET_ID, amount);
    }
}
