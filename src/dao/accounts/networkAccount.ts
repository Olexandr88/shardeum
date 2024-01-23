import * as crypto from '@shardus/crypto-utils'
import { daoConfig } from '../../config/dao'
import { DeveloperPayment, Windows, WindowRange } from '../types'
import { AccountType, BaseAccount, NetworkParameters } from '../../shardeum/shardeumTypes'
import { initialNetworkParamters } from '../../shardeum/initialNetworkParameters'

export class DaoGlobalAccount implements BaseAccount {
  readonly accountType: AccountType.DaoAccount = AccountType.DaoAccount
  id: string

  windows: Windows
  nextWindows: Windows | Record<string, never> = {}

  devWindows: Windows
  nextDevWindows: Windows | Record<string, never> = {}

  issue = 1
  devIssue = 1

  developerFund: DeveloperPayment[] = []
  nextDeveloperFund: DeveloperPayment[] = []

  current: NetworkParameters
  next: NetworkParameters | Record<string, never> = {}

  timestamp = 0

  hash: crypto.hexstring

  constructor(
    accountId: string,
    timestamp = 0,
    windows?: Windows,
    devWindows?: Windows,
    networkParamters?: NetworkParameters
  ) {
    const proposalWindow = new WindowRange(timestamp, daoConfig.TIME_FOR_PROPOSALS)
    const votingWindow = proposalWindow.nextRange(daoConfig.TIME_FOR_VOTING)
    const graceWindow = votingWindow.nextRange(daoConfig.TIME_FOR_GRACE)
    const applyWindow = graceWindow.nextRange(daoConfig.TIME_FOR_APPLY)

    const devProposalWindow = new WindowRange(timestamp, daoConfig.TIME_FOR_DEV_PROPOSALS)
    const devVotingWindow = devProposalWindow.nextRange(daoConfig.TIME_FOR_DEV_VOTING)
    const devGraceWindow = devVotingWindow.nextRange(daoConfig.TIME_FOR_DEV_GRACE)
    const devApplyWindow = devVotingWindow.nextRange(daoConfig.TIME_FOR_DEV_APPLY)

    this.id = accountId
    this.windows = windows ?? {
      proposalWindow,
      votingWindow,
      graceWindow,
      applyWindow,
    }
    this.devWindows = devWindows ?? {
      proposalWindow: devProposalWindow,
      votingWindow: devVotingWindow,
      graceWindow: devGraceWindow,
      applyWindow: devApplyWindow,
    }
    this.current = networkParamters ?? initialNetworkParamters
    this.hash = crypto.hashObj(this.getHashable())
    console.log('INITIAL_HASH: ', this.hash)

    // TODO: There are a lot of hard coded values in the `change` field below.
    //       Can/should they be taken from another source to avoid duplication?
    /* TODO: add to class?
    this.listOfChanges = [
      {
        cycle: 1,
        change: {
          server: {
            transactionExpireTime: 5,
            p2p: {
              syncLimit: 180,
              cycleDuration: 30,
              maxRejoinTime: 20,
              difficulty: 2,
              queryDelay: 1,
              gossipRecipients: 8,
              gossipFactor: 4,
              gossipStartSeed: 15,
              gossipSeedFallof: 15,
              gossipTimeout: 180,
              maxSeedNodes: 10,
              minNodesToAllowTxs: 3,
              minNodes: 15,
              maxNodes: 30,
              seedNodeOffset: 4,
              nodeExpiryAge: 30,
              maxJoinedPerCycle: 1,
              maxSyncingPerCycle: 5,
              maxRotatedPerCycle: 1,
              maxPercentOfDelta: 40,
              minScaleReqsNeeded: 5,
              maxScaleReqs: 200,
              scaleConsensusRequired: 0.25,
              amountToGrow: 1,
              amountToShrink: 1,
              startInWitnessMode: false,
            },
            reporting: {
              report: true,
              recipient: 'http://127.0.0.1:3000/api',
              interval: 2,
              console: false,
            },
            loadDetection: {
              queueLimit: 1000,
              desiredTxTime: 15,
              highThreshold: 0.5,
              lowThreshold: 0.2,
            },
            rateLimiting: {
              limitRate: true,
              loadLimit: {
                internal: 0.5,
                external: 0.4,
                txTimeInQueue: 0.2,
                queueLength: 0.2,
              },
            },
          },
        },
      },
    ],
    */
  }

  getHashable(): object {
    return {
      id: this.id,
      windows: this.windows,
      nextWindows: this.nextWindows,
      devWindows: this.devWindows,
      nextDevWindows: this.nextDevWindows,
      issue: this.issue,
      devIssue: this.devIssue,
      developerFund: this.developerFund,
      nextDeveloperFund: this.nextDeveloperFund,
      current: this.current,
      next: this.next,
      timestamp: this.timestamp,
    }
  }
}