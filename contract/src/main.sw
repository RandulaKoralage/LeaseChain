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
    logging::log,
};

enum InvalidError {
    IncorrectAssetId: AssetId,
    OnlyLandOwner: Identity,
    OnlyTenant: Identity,
    LeaseIsNotActive: u8, //1
    RequestPending: u8, // RR:2 TR:3
    NoDueAmount: u64,
}

struct LeaseAgreement {
    id: u64,
    leaseAmount: u64,
    dueAmount: u64,
    leaseDuration: u64,
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
    // counter for total leases listed
    lease_counter: u64 = 0,
    // map of lease IDs to leases
    lease_map: StorageMap<u64, LeaseAgreement> = StorageMap {},
}

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

impl LeaseHandler for Contract {
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

    #[storage(read)]
    fn get_lease(lease_id: u64) -> LeaseAgreement {
        return storage.lease_map.get(lease_id).try_read().unwrap();
    }

    #[storage(read)]
    fn get_count() -> u64 {
        return storage.lease_counter.try_read().unwrap();
    }

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

    //Renew contract approve
    #[storage(read, write)]
    fn approve_renew_lease(lease_id: u64) -> LeaseAgreement {
        let mut lease_agreement = storage.lease_map.get(lease_id).try_read().unwrap();
        let sender = msg_sender().unwrap();
        require(
            sender == lease_agreement
                .landLoard,
            InvalidError::OnlyLandOwner(sender),
        );
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive(1),
        );
        require(
            from_str_array(lease_agreement.requestStatus) == "RR",
            InvalidError::RequestPending(2),
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
        let sender = msg_sender().unwrap();
        require(
            sender == lease_agreement
                .landLoard,
            InvalidError::OnlyLandOwner(sender),
        );
        require(
            from_str_array(lease_agreement.leaseStatus) != "T",
            InvalidError::LeaseIsNotActive(1),
        );
        require(
            from_str_array(lease_agreement.requestStatus) == "TR",
            InvalidError::RequestPending(3),
        );

        lease_agreement.requestStatus = __to_str_array("TA");
        lease_agreement.leaseStatus = __to_str_array("A");
        storage.lease_map.insert(lease_id, lease_agreement);
        return lease_agreement;
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
}
