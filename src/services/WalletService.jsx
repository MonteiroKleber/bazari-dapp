// ===============================
// WALLET SERVICE - SIMPLES
// ===============================

class WalletService {
  // ===============================
  // FORMATAÇÃO
  // ===============================
  
  formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  formatTokenAmount(amount, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount)
  }

  shortenAddress(address, chars = 4) {
    if (!address) return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  }

  // ===============================
  // UTILITÁRIOS
  // ===============================

  getTransactionIcon(type) {
    const icons = {
      send: '📤',
      receive: '📥',
      trade: '🔄',
      mint: '🏭',
      burn: '🔥',
      stake: '🔒',
      unstake: '🔓'
    }
    return icons[type] || '💱'
  }

  getStatusColor(status) {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error'
    }
    return colors[status] || 'neutral'
  }
}

// Export singleton instance
export default new WalletService()