import { BigNumber } from "@ethersproject/bignumber";

export interface NFT {
  id: number;
  tier: string;
  camp?: string;
  type?: string;
  transferrable: boolean;
  burnable: boolean;

  title: string;
  description: string;
  image: string;
  staked?: boolean;
  animation_url?: string;
  stakedBalance?: number;
  unstakedBalance?: number;
}

export interface NFTCollection {
  title: string;
  description: string;
  nfts: NFT[];
}

export interface Card {
  quantity: number;
  sold: number;
  value: BigNumber;
}

export interface Owned {
  stakedBalance?: number;
  unstakedBalance?: number;
}