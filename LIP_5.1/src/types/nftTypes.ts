import { BigNumber } from "@ethersproject/bignumber";

export interface NFT {
  id: number;
  staked?: boolean;
  stakedBalance?: number;
  unstakedBalance?: number;
}

export interface NFTAttributes {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: NFTAttributes[];
}

export interface NFTCollection {
  title: string;
  description: string;
  nfts: NFT[];
}

export interface Card {
  metadata: NFTMetadata;
  quantity: number;
  sold: number;
  value: BigNumber;
  getName(): string;
  getCamp(): string;
  getGender(): string;
  getRarity(): string;
  getType(): string;
  getID(): string;
}

export interface Owned {
  id: number;
  stakedBalance?: number;
  unstakedBalance?: number;
}

export interface POOL {
  isUndefined(): boolean;
  poolId: number;
  nftTokenId: number;
  totalStakes: number;
  totalRewards: number;
  rewardPerNFT: number;
  rewardPeriod: number;
  maxPerClaim: number;
}

export interface BALANCE {
  isUndefined(): boolean;
  nftTokenId: number;
  amount: number;
  rewardSoFar: number;
  firstStakedAt: number;
  lastClaimedAt: number;
}
