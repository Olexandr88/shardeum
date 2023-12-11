import { Shardus } from '@shardus/core'
import shardus from '@shardus/core/dist/shardus'
import { ApplyResponse } from '@shardus/core/dist/shardus/shardus-types'
import { createInternalTxReceipt } from '..'
import { ShardeumFlags } from '../shardeum/shardeumFlags'
import {
  AccountType,
  InternalTXType,
  InternalTx,
  NetworkAccount,
  WrappedStates,
} from '../shardeum/shardeumTypes'
import { DaoGlobalAccount } from './accounts/networkAccount'
import { daoAccount, daoConfig } from './config'

export function setupDaoAccount(shardus: Shardus, when: number): void {
  if (ShardeumFlags.EnableDaoFeatures) {
    const daoValue = {
      isInternalTx: true,
      internalTXType: InternalTXType.InitDao,
      timestamp: when,
    }
    shardus.setGlobal(daoAccount, daoValue, when, daoAccount)
  }
}

export function applyInitDaoTx(
  wrappedStates: WrappedStates,
  applyResponse: ApplyResponse,
  internalTx: InternalTx,
  txTimestamp: number,
  txId: string
): void {
  const dao: NetworkAccount = wrappedStates[daoAccount].data
  dao.timestamp = txTimestamp
  if (ShardeumFlags.supportInternalTxReceipt) {
    createInternalTxReceipt(shardus, applyResponse, internalTx, daoAccount, daoAccount, txTimestamp, txId)
  }
}

export function getRelevantDataInitDao(accountId, wrappedEVMAccount): boolean {
  if (!wrappedEVMAccount) {
    if (accountId === daoAccount) {
      wrappedEVMAccount = createDaoAccount()
      return true
    } else {
      //wrappedEVMAccount = createNodeAccount(accountId) as any
    }
    return false
  }
}

function createDaoAccount(timestamp = 0): DaoGlobalAccount {
  const proposalWindow = [timestamp, timestamp + daoConfig.TIME_FOR_PROPOSALS]
  const votingWindow = [proposalWindow[1], proposalWindow[1] + daoConfig.TIME_FOR_VOTING]
  const graceWindow = [votingWindow[1], votingWindow[1] + daoConfig.TIME_FOR_GRACE]
  const applyWindow = [graceWindow[1], graceWindow[1] + daoConfig.TIME_FOR_APPLY]

  const devProposalWindow = [timestamp, timestamp + daoConfig.TIME_FOR_DEV_PROPOSALS]
  const devVotingWindow = [devProposalWindow[1], devProposalWindow[1] + daoConfig.TIME_FOR_DEV_VOTING]
  const devGraceWindow = [devVotingWindow[1], devVotingWindow[1] + daoConfig.TIME_FOR_DEV_GRACE]
  const devApplyWindow = [devGraceWindow[1], devGraceWindow[1] + daoConfig.TIME_FOR_DEV_APPLY]

  const account: DaoGlobalAccount = {
    windows: {
      proposalWindow,
      votingWindow,
      graceWindow,
      applyWindow,
    },
    nextWindows: {},
    devWindows: {
      devProposalWindow,
      devVotingWindow,
      devGraceWindow,
      devApplyWindow,
    },
    nextDevWindows: {},
    developerFund: [],
    nextDeveloperFund: [],
    issue: 1,
    devIssue: 1,
    id: daoAccount,
    hash: '',
    timestamp: 0,
    accountType: AccountType.DaoAccount,
  }
  return account
}

export function isDaoTx(tx): boolean {
  /* Got really lazy here, but we need to do our own analysis to determine if the raw evm tx is a dao tx. */
  return tx.to === daoAccount
}

export function handleDaoTxCrack(
  otherAccountKeys,
  txSenderEvmAddr,
  txToEvmAddr,
  transformedSourceKey,
  result
): void {
  /** [TODO]
   * Liberus txs export a `keys` fn that gets called here
   */
  return
}

export function handleDaoTxGetRelevantData(
  shardus: Shardus,
  tx
): {
  accountId: any
  accountCreated: any
  isPartial: boolean
  stateId: any
  timestamp: any
  data: any
} {
  /**
   * [TODO]
   * Liberus txs export a `createRelevantAccount` fn that gets called here
   */
  return shardus.createWrappedResponse(tx, tx.to, tx.from, tx.value, tx.data, tx.timestamp, tx.hash, tx.id)
}

export function handleDaoTxApply(shardus: Shardus, tx): void {
  /**
   * [TODO]
   * Got really lazy here, but we need to do our own analysis to determine if the raw evm tx is a dao tx.
   * 
   * Liberus txs export a `apply` fn that gets called here
   */
  return
}