import { useContext } from 'react'
import { Context } from '../contexts/KiraProvider'

const useKira = () => {
  const { kira } = useContext(Context)
  return kira
}

export default useKira
