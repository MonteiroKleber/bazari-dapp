// packages/chain-client/src/index.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { EventEmitter } from 'eventemitter3';
import BN from 'bn.js';
// ---------- ChainClient ----------
export class ChainClient extends EventEmitter {
    constructor(config = {}) {
        super();
        this.api = null;
        this.provider = null;
        this.endpoint = config.wsEndpoint ?? 'ws://127.0.0.1:9944';
        this.types = config.types;
        this.rpc = config.rpc;
        if (config.autoConnect) {
            void this.connect().catch((err) => this.emit('error', err));
        }
    }
    // ------------- Connection -------------
    async connect() {
        if (this.api?.isConnected)
            return;
        this.provider = new WsProvider(this.endpoint);
        this.api = await ApiPromise.create({
            provider: this.provider,
            types: this.types,
            rpc: this.rpc
        });
        await this.api.isReady;
        this.emit('connected');
        this.api.on('disconnected', () => this.emit('disconnected'));
        this.api.on('error', (e) => this.emit('error', e));
    }
    async disconnect() {
        if (this.unsubNewHeads) {
            this.unsubNewHeads();
            this.unsubNewHeads = undefined;
        }
        if (this.unsubFinalizedHeads) {
            this.unsubFinalizedHeads();
            this.unsubFinalizedHeads = undefined;
        }
        if (this.api) {
            await this.api.disconnect();
            this.api = null;
            this.provider = null;
            this.emit('disconnected');
        }
    }
    isConnected() {
        return !!this.api && this.api.isConnected;
    }
    getApi() {
        if (!this.api)
            throw new Error('API not connected');
        return this.api;
    }
    // ------------- Chain info -------------
    async getChainInfo() {
        const api = this.getApi();
        const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version()
        ]);
        const decimals = api.registry.chainDecimals?.[0] ?? 12;
        const tokenSymbol = api.registry.chainTokens?.[0] ?? 'UNIT';
        return {
            name: chain.toString(),
            version: `${nodeName.toString()} ${nodeVersion.toString()}`,
            decimals,
            tokenSymbol
        };
    }
    // ------------- Blocks -------------
    async getBlockNumber() {
        const api = this.getApi();
        const bn = await api.query.system.number();
        return Number(bn.toString());
    }
    async getBlockHash(blockNumber) {
        const api = this.getApi();
        const hash = blockNumber !== undefined
            ? await api.rpc.chain.getBlockHash(blockNumber)
            : await api.rpc.chain.getBlockHash();
        return hash.toString();
    }
    // ------------- Balances -------------
    async getAccountBalance(address) {
        const api = this.getApi();
        const account = (await api.query.system.account(address));
        const toBig = (x) => BigInt(x?.toString?.() ?? '0');
        const free = toBig(account.data.free);
        const reserved = toBig(account.data.reserved);
        const miscFrozen = toBig(account.data.miscFrozen);
        const feeFrozen = toBig(account.data.feeFrozen);
        const total = free + reserved;
        return { free, reserved, miscFrozen, feeFrozen, total };
    }
    // ------------- Subscriptions -------------
    async subscribeNewHeads(cb) {
        const api = this.getApi();
        const unsub = await api.rpc.chain.subscribeNewHeads((lastHeader) => {
            try {
                cb(lastHeader);
                this.emit('newHead', lastHeader);
            }
            catch (e) {
                this.emit('error', e);
            }
        });
        this.unsubNewHeads = unsub;
        return unsub;
    }
    async subscribeFinalizedHeads(cb) {
        const api = this.getApi();
        const unsub = await api.rpc.chain.subscribeFinalizedHeads((header) => {
            try {
                cb(header);
                this.emit('finalizedHead', header);
            }
            catch (e) {
                this.emit('error', e);
            }
        });
        this.unsubFinalizedHeads = unsub;
        return unsub;
    }
    // ------------- Extrinsics -------------
    async signAndSend(extrinsic, signer, statusCb) {
        this.getApi(); // assegura conectado
        return new Promise(async (resolve, reject) => {
            try {
                const unsubscribe = await extrinsic.signAndSend(signer, (result) => {
                    statusCb?.(result);
                    this.emit('txStatus', result);
                    if (result.status.isFinalized) {
                        const blockHash = result.status.asFinalized.toString();
                        this.emit('txFinalized', { blockHash, result });
                        unsubscribe();
                        resolve(blockHash);
                    }
                    else if (result.isError) {
                        unsubscribe();
                        reject(new Error('Extrinsic failed'));
                    }
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    // Utilitário para formatar quantidade em BN baseado em decimais
    toChainUnits(value, decimals) {
        const api = this.getApi();
        const d = decimals ?? (api.registry.chainDecimals?.[0] ?? 12);
        const [whole, frac = ''] = String(value).split('.');
        const fracPadded = frac.padEnd(d, '0').slice(0, d);
        const base = new BN(10).pow(new BN(d));
        const wholeBn = new BN(whole).mul(base);
        const fracBn = new BN(fracPadded || '0');
        return wholeBn.add(fracBn);
    }
}
// ---------- Re-exports ----------
export { default as BN } from 'bn.js';
export { mnemonicGenerate, mnemonicValidate, mnemonicToMiniSecret } from '@polkadot/util-crypto';
export { Keyring };
//# sourceMappingURL=index.js.map