/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { NFT_FARM_ADDRESS } from "src/config";
import { QueryDataTypes } from "src/types/queryDataTypes";
import { useContracts } from "./useContracts";

export function useQueries(account: string | null): QueryDataTypes {
  const { token, stakingPool } = useContracts();
  const [kexDecimals, setKexDecimals] = useState<number | undefined>(undefined);
  const [kexBalance, setKexBalance] = useState<number | undefined>(undefined);
  const [stakedBalance, setStakedBalance] = useState<number | undefined>(undefined);
  const [allowance, setAllowance] = useState<number | undefined>(undefined);
  const [krystalBalance, setKrystalBalance] = useState<number | undefined>(undefined);

  async function updateInfo() {
    if (account) {
      const kexDecimals = await token.decimals();
      setKexDecimals(kexDecimals);

      var decimalFactor = Math.pow(10,kexDecimals);

      const kexBalance = await token.balanceOf(account);
      setKexBalance(kexBalance/decimalFactor);

      const krystalBalance = await stakingPool.rewardedStones(account);
      setKrystalBalance(krystalBalance);

      const stakedBalance = await stakingPool.farmed(account);
      setStakedBalance(stakedBalance/decimalFactor);

      const allowance = await token.allowance(account, NFT_FARM_ADDRESS);
      setAllowance(allowance/decimalFactor);
    }
  }

  useEffect(() => {
    setKexDecimals(undefined);
    setKexBalance(undefined);
    setKrystalBalance(undefined);
    setStakedBalance(undefined);
    setAllowance(undefined);
    updateInfo();
  }, [account]);

  async function loadAllowance() {
    if (account !== null) {
      const allowance = await token.allowance(account, NFT_FARM_ADDRESS);
      setAllowance(allowance);
    }
  }

  return { kexDecimals, kexBalance, krystalBalance, stakedBalance, allowance, loadAllowance, updateInfo };
}
