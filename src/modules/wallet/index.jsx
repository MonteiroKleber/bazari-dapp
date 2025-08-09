// ===============================
// WALLET MODULE INDEX - CORRIGIDO
// ===============================

import React from 'react'
import WalletMain from './WalletMain'

// ===============================
// WALLET MODULE MAIN COMPONENT
// ===============================
const WalletModule = () => {
  return <WalletMain />
}

// Export individual components for flexibility
export { WalletMain }

// Export hooks
export {
  useWallet,
  useTransactions,
  useWalletAnalytics,
  useSendToken,
  useReceiveToken,
  useTokens,
  useWalletUI
} from './useWalletStore'

// Export main module component
export default WalletModule