/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.79.0
  Forc version: 0.49.3
  Fuel-Core version: 0.22.1
*/

import type {
  BigNumberish,
  BN,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
} from 'fuels';

import type { Enum } from "./common";

export type IdentityInput = Enum<{ Address: AddressInput, ContractId: ContractIdInput }>;
export type IdentityOutput = Enum<{ Address: AddressOutput, ContractId: ContractIdOutput }>;
export type InvalidErrorInput = Enum<{ IncorrectAssetId: AssetIdInput, OnlyLandOwner: IdentityInput, OnlyTenant: IdentityInput, LeaseIsNotActive: BigNumberish, RequestPending: BigNumberish, NoDueAmount: BigNumberish }>;
export type InvalidErrorOutput = Enum<{ IncorrectAssetId: AssetIdOutput, OnlyLandOwner: IdentityOutput, OnlyTenant: IdentityOutput, LeaseIsNotActive: number, RequestPending: number, NoDueAmount: BN }>;

export type AddressInput = { value: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { value: string };
export type AssetIdOutput = AssetIdInput;
export type ContractIdInput = { value: string };
export type ContractIdOutput = ContractIdInput;
export type LeaseAgreementInput = { id: BigNumberish, leaseAmount: BigNumberish, dueAmount: BigNumberish, leaseDuration: BigNumberish, secutrityDeposit: BigNumberish, leaseMaximumDue: BigNumberish, illegalActivity: boolean, damagedToProperty: boolean, leaseStartDate: BigNumberish, leaseRenewalDate: BigNumberish, landLoard: IdentityInput, tenant: IdentityInput, leaseStatus: string, requestStatus: string, evictionWarning: boolean };
export type LeaseAgreementOutput = { id: BN, leaseAmount: BN, dueAmount: BN, leaseDuration: BN, secutrityDeposit: BN, leaseMaximumDue: BN, illegalActivity: boolean, damagedToProperty: boolean, leaseStartDate: BN, leaseRenewalDate: BN, landLoard: IdentityOutput, tenant: IdentityOutput, leaseStatus: string, requestStatus: string, evictionWarning: boolean };

interface ContractAbiInterface extends Interface {
  functions: {
    add_lease: FunctionFragment;
    approve_renew_lease: FunctionFragment;
    approve_terminate_lease: FunctionFragment;
    get_count: FunctionFragment;
    get_lease: FunctionFragment;
    pay_leases: FunctionFragment;
    request_renew_lease: FunctionFragment;
    request_terminate_lease: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'add_lease', values: [LeaseAgreementInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'approve_renew_lease', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'approve_terminate_lease', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_count', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'get_lease', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'pay_leases', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'request_renew_lease', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'request_terminate_lease', values: [BigNumberish]): Uint8Array;

  decodeFunctionData(functionFragment: 'add_lease', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'approve_renew_lease', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'approve_terminate_lease', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_count', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_lease', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'pay_leases', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'request_renew_lease', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'request_terminate_lease', data: BytesLike): DecodedValue;
}

export class ContractAbi extends Contract {
  interface: ContractAbiInterface;
  functions: {
    add_lease: InvokeFunction<[agreement: LeaseAgreementInput], BN>;
    approve_renew_lease: InvokeFunction<[lease_id: BigNumberish], LeaseAgreementOutput>;
    approve_terminate_lease: InvokeFunction<[lease_id: BigNumberish], LeaseAgreementOutput>;
    get_count: InvokeFunction<[], BN>;
    get_lease: InvokeFunction<[lease_id: BigNumberish], LeaseAgreementOutput>;
    pay_leases: InvokeFunction<[lease_id: BigNumberish], void>;
    request_renew_lease: InvokeFunction<[lease_id: BigNumberish], LeaseAgreementOutput>;
    request_terminate_lease: InvokeFunction<[lease_id: BigNumberish], LeaseAgreementOutput>;
  };
}
