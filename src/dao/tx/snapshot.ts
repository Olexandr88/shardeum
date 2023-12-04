import * as crypto from '@shardus/crypto-utils'
import { Shardus, ShardusTypes } from '@shardus/core'
import config from '../../config'
import { Snapshot } from '../types'
import { NetworkAccount } from '../accounts/networkAccount'
import { TransactionKeys, WrappedStates } from '../../shardeum/shardeumTypes'
import { UserAccount } from '../accounts/userAccount'
import { WrappedResponse } from '@shardus/core/dist/shardus/shardus-types'

export function validateFields(tx: Snapshot, response: ShardusTypes.IncomingTransactionResult): ShardusTypes.IncomingTransactionResult {
  if (typeof tx.from !== 'string') {
    response.success = false
    response.reason = 'tx "from" field must be a string.'
    throw new Error(response.reason)
  }
  if (typeof tx.snapshot !== 'object') {
    response.success = false
    response.reason = 'tx "snapshot" field must be an object.'
    throw new Error(response.reason)
  }
  return response
}

export function validate(tx: Snapshot, response: ShardusTypes.IncomingTransactionResult): ShardusTypes.IncomingTransactionResult {
  if (tx.sign.owner !== tx.from) {
    response.reason = 'not signed by from account'
    return response
  }
  if (crypto.verifyObj(tx) === false) {
    response.reason = 'incorrect signing'
    return response
  }
  response.success = true
  response.reason = 'This transaction is valid!'
  return response
}

export function apply(tx: Snapshot, txTimestamp: number, wrappedStates: WrappedStates, dapp: Shardus): void {
  const network: NetworkAccount = wrappedStates[config.dao.networkAccount].data
  network.snapshot = tx.snapshot
  network.timestamp = txTimestamp
  dapp.log('Applied snapshot tx', network)
}

export function keys(tx: Snapshot, result: TransactionKeys): TransactionKeys {
  result.sourceKeys = [tx.from]
  result.targetKeys = [config.dao.networkAccount]
  result.allKeys = [...result.sourceKeys, ...result.targetKeys]
  return result
}

export function createRelevantAccount(dapp: Shardus, account: UserAccount, accountId: string, accountCreated = false): WrappedResponse {
  if (!account) {
    throw new Error('Account must already exist for the snapshot transaction')
  }
  return dapp.createWrappedResponse(accountId, accountCreated, account.hash, account.timestamp, account)
}
