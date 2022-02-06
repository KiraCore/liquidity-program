import { useMemo } from 'react';
import { useWallet } from 'use-wallet';
import { providers as EthersProviders } from 'ethers';
import { create as createERC20 } from '../lib/erc20';
import { create as createERC1155 } from '../lib/erc1155';
import { create as createStakingPool } from '../lib/farm';
import { create as createNFTStaking } from '../lib/nftstake';
import { NFT_FARM_ADDRESS, KIRA_TOKEN_ADDRESS, NFT_MINTING_ADDRESS, NFT_STAKING_ADDRESS } from 'src/config';

export function useContracts() {
  const { ethereum }: { ethereum: any } = useWallet();
  const ethers = useMemo(() => (ethereum ? new EthersProviders.Web3Provider(ethereum) : null), [ethereum]);

  const signer = ethers ? ethers.getSigner() : null;  

  const token = createERC20(KIRA_TOKEN_ADDRESS, signer);

  const nft = createERC1155(
    NFT_MINTING_ADDRESS,
    signer ? signer : new EthersProviders.InfuraProvider(process.env.REACT_APP_INFURA_NETWORK, process.env.REACT_APP_INFURA_KEY),
  );

  const stakingPool = createStakingPool(NFT_FARM_ADDRESS, signer);

  const nftStaking = createNFTStaking(NFT_STAKING_ADDRESS, signer);

  return { ethers, token, nft, stakingPool, nftStaking };
}
