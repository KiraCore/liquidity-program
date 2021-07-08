import { useState } from 'react';

export function useModal() {
  const [isOpenStakeModal, showStakeModal] = useState<boolean>(false);
  const [isOpenUnstakeModal, showUnstakeModal] = useState<boolean>(false);

  return { isOpenStakeModal, isOpenUnstakeModal, showStakeModal, showUnstakeModal };
}
