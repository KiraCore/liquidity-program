import { Contract, ethers } from 'ethers';

const abi = [
  {
    "inputs": [
      {
        "internalType": "contract KiraAccessControl",
        "name": "_accessControl",
        "type": "address"
      },
      {
        "internalType": "contract RewardDistributor",
        "name": "_distributor",
        "type": "address"
      },
      {
        "internalType": "contract IERC1155",
        "name": "_nftToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Stake",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Unstake",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      }
    ],
    "name": "getFirstStakedAtOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      }
    ],
    "name": "getRewardSoFarOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      }
    ],
    "name": "getTotalStakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      }
    ],
    "name": "rewardOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      }
    ],
    "name": "totalStakeOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nftTokenId",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract KiraAccessControl",
        "name": "_accessControl",
        "type": "address"
      }
    ],
    "name": "updateAccessControl",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract RewardDistributor",
        "name": "_distributor",
        "type": "address"
      }
    ],
    "name": "updateDistributor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const create = (address: string, provider: any) => {
  const contract = new Contract(address, abi, provider);

  // READ
  // const cards = (id: number) => contract.cards(id).then((val: any) => val);
  const totalStakeOf = (id: number, address: string) => contract.totalStakeOf(id, address).then((val: any) => val.toNumber());
  const rewardOf = (id: number, address: string) => contract.rewardOf(id, address).then((val: any) => ethers.utils.formatEther(val));
  // const isCardPayable = (id: number) => contract.isCardPayable(id).then((val: any) => val);
  // const rewardedStones = (address: string) =>
  //   contract.rewardedStones(address).then((v: BigNumber) => parseFloat(ethers.utils.formatEther(v)));
  // const farmed = (address: string) =>
  //   contract.farmed(address).then((v: BigNumber) => parseFloat(ethers.utils.formatEther(v)));
  // const minContribution = () => contract.minContribution().then((v: BigNumber) => ethers.utils.formatEther(v));
  // const maxContribution = () => contract.maxContribution().then((v: BigNumber) => ethers.utils.formatEther(v));

  // WRITE
  const stake = (nftId: number, amount: number) => contract.stake(nftId, amount);

  const unstake = (nftId: number) => contract.unstake(nftId);

  const claimReward = (nftId: number) => contract.claimReward(nftId);

  return {
    rewardOf,
    totalStakeOf,
    stake,
    unstake,
    claimReward
  };
};
