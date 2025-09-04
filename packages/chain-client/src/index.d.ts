import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { EventEmitter } from 'eventemitter3';
import BN from 'bn.js';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
export interface ChainClientConfig {
    wsEndpoint?: string;
    types?: Record<string, unknown>;
    rpc?: Record<string, unknown>;
    autoConnect?: boolean;
}
export interface AccountBalance {
    free: bigint;
    reserved: bigint;
    miscFrozen: bigint;
    feeFrozen: bigint;
    total: bigint;
}
export interface ChainInfo {
    name: string;
    version: string;
    chainType?: string;
    decimals: number;
    tokenSymbol: string;
}
type Unsub = () => void;
export declare class ChainClient extends EventEmitter {
    private api;
    private provider;
    private unsubNewHeads?;
    private unsubFinalizedHeads?;
    private endpoint;
    private types?;
    private rpc?;
    constructor(config?: ChainClientConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getApi(): ApiPromise;
    getChainInfo(): Promise<ChainInfo>;
    getBlockNumber(): Promise<number>;
    getBlockHash(blockNumber?: number): Promise<string>;
    getAccountBalance(address: string): Promise<AccountBalance>;
    subscribeNewHeads(cb: (header: any) => void): Promise<Unsub>;
    subscribeFinalizedHeads(cb: (header: any) => void): Promise<Unsub>;
    signAndSend(extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>, signer: KeyringPair, statusCb?: (result: ISubmittableResult) => void): Promise<string>;
    toChainUnits(value: string | number, decimals?: number): BN;
}
export { default as BN } from 'bn.js';
export { mnemonicGenerate, mnemonicValidate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
export { Keyring };
//# sourceMappingURL=index.d.ts.map