import { useMemo } from 'react';
import { useWallet } from 'use-wallet';
import { providers as EthersProviders } from 'ethers';
import { create as createERC20 } from '../lib/erc20';
import { create as createERC1155 } from '../lib/erc1155';
import { create as createStakingPool } from '../lib/farm';
import { create as createNFTStaking } from '../lib/nftstake';
import { KEX_FARM_CONTRACT_ADDR, MOCK_KEX_CONTRACT_ADDR, NFT_CONTRACT_ADDR, NFT_STAKING_CONTRACT_ADDR } from 'src/config';

export function useContracts() {
  const { ethereum }: { ethereum: any } = useWallet();
  const ethers = useMemo(() => (ethereum ? new EthersProviders.Web3Provider(ethereum) : null), [ethereum]);

  const signer = ethers ? ethers.getSigner() : null;  

  const token = createERC20(MOCK_KEX_CONTRACT_ADDR, signer);

  const nft = createERC1155(
    NFT_CONTRACT_ADDR,
    signer ? signer : new EthersProviders.InfuraProvider(process.env.REACT_APP_INFURA_NETWORK, process.env.REACT_APP_INFURA_KEY),
  );

  const stakingPool = createStakingPool(KEX_FARM_CONTRACT_ADDR, signer);

  const nftStaking = createNFTStaking(NFT_STAKING_CONTRACT_ADDR, signer);

  return { ethers, token, nft, stakingPool, nftStaking };
}
