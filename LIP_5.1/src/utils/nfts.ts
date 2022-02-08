import { NFTCollection } from "src/types/nftTypes";

export const commonCollection: NFTCollection = {
  title: 'Common Collection',
  description: 'KIRA’s and Attar’s army of Hackers, Cyborgs, and Mages, battling against each other for financial freedom or dystopian state. ',
  nfts: [
    {
      id: 1,
      tier: 'Common',
      title: 'Samael, Mage - KIRA Team',
      description: '',
      image: '/images/1.jpeg',
      animation_url: "/images/1.mp4"
    },
    {
      id: 2,
      tier: 'Common',
      title: 'Azrael, Dark Mage - Attar Team',
      description: '',
      image: "/images/2.jpeg",
      animation_url: "/images/2.mov"
    },
    {
      id: 3,
      tier: 'Common',
      title: 'Maalik, White Hacker - KIRA Team',
      description: '',
      image: "/images/3.png",
    },
    {
      id: 4,
      tier: 'Common',
      title: 'Lucy, Cyborg - Attar Team',
      description: '',
      image: "/images/4.jpeg",
    },
    {
      id: 5,
      tier: 'Common',
      title: 'Mikhaela, Cyborg - KIRA Team',
      description: '',
      image: "/images/5.jpeg",
    },
    {
      id: 6,
      tier: 'Common',
      title: 'Kali, White Hacker - KIRA Team',
      description: '',
      image: "/images/6.jpeg",
    },
  ],
};

export const uncommonCollection: NFTCollection = {
  title: 'Uncommon Collection',
  description:
    'Attar, himself, decides to step in. To support KIRA’s mission and secure victory, KIRA’s allies decide to join forces – Ethereum, Cosmos, Binance Smart Chain, and Polkadot.',
  nfts: [],
};