import { useContext } from 'react'
import { Context } from '../contexts/SquidProvider'

const useSquid = () => {
  const { squid } = useContext(Context)
  return squid
}

export default useSquid
