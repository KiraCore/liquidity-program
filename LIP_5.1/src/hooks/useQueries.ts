/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { KEX_FARM_CONTRACT_ADDR } from "src/config";
import { QueryDataTypes } from "src/types/queryDataTypes";
import { useContracts } from "./useContracts";

export function useQueries(account: string | null): QueryDataTypes {
  const { token, stakingPool } = useContracts();
  const [kexBalance, setKexBalance] = useState<number | undefined>(undefined);
  const [stakedBalance, setStakedBalance] = useState<number | undefined>(undefined);
  const [allowance, setAllowance] = useState<number | undefined>(undefined);
  const [krystalBalance, setKrystalBalance] = useState<number | undefined>(undefined);

  async function updateInfo() {
    if (account) {
      const kexBalance = await token.balanceOf(account);
      setKexBalance(kexBalance);

      const krystalBalance = await stakingPool.rewardedStones(account);
      setKrystalBalance(krystalBalance);

      const stakedBalance = await stakingPool.farmed(account);
      setStakedBalance(stakedBalance);

      const allowance = await token.allowance(account, KEX_FARM_CONTRACT_ADDR);
      setAllowance(allowance);
    }
  }

  useEffect(() => {
    setKexBalance(undefined);
    setKrystalBalance(undefined);
    setStakedBalance(undefined);
    setAllowance(undefined);
    updateInfo();
  }, [account]);

  async function loadAllowance() {
    if (account !== null) {
      const allowance = await token.allowance(account, KEX_FARM_CONTRACT_ADDR);
      setAllowance(allowance);
    }
  }

  return { kexBalance, krystalBalance, stakedBalance, allowance, loadAllowance, updateInfo };
}
