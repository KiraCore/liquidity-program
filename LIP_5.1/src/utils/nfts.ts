import { NFT, NFTCollection } from "src/types/nftTypes";

export const commonCollection: NFTCollection = {
  title: 'Common Collection',
  description: 'KIRA’s and Attar’s army of Hackers, Cyborgs, and Mages, battling against each other for financial freedom or dystopian state. ',
  nfts: [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
  ],
};

export const uncommonCollection: NFTCollection = {
  title: 'Uncommon Collection',
  description:
    'Attar, himself, decides to step in. To support KIRA’s mission and secure victory, KIRA’s allies decide to join forces – Ethereum, Cosmos, Binance Smart Chain, and Polkadot.',
    nfts: [
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
    ],
};

export const rareCollection: NFTCollection = {
  title: 'Rare Collection',
  description:
    'Attar, himself, decides to step in. To support KIRA’s mission and secure victory, KIRA’s allies decide to join forces – Ethereum, Cosmos, Binance Smart Chain, and Polkadot.',
    nfts: [
      { id: 12 },
      { id: 13 },
      { id: 14 }
    ],
};


export function getAllNFT(){
  return Array.from(commonCollection.nfts.values()).concat(
    Array.from(uncommonCollection.nfts.values())).concat(
      Array.from(rareCollection.nfts.values()));
}