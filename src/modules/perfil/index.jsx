// ===============================
// PERFIL MODULE INDEX - CORRIGIDO
// ===============================

import React from 'react'
import PerfilMain from './PerfilMain'

// ===============================
// PROFILE MODULE MAIN COMPONENT
// ===============================
const ProfileModule = () => {
  return <PerfilMain />
}

// Export individual components for flexibility
export { PerfilMain }

// Export hooks
export {
  useProfile,
  useBusinesses,
  useActivity,
  useProfileToken,
  useProfileUI
} from './useProfileStore'

// Export main module component
export default ProfileModule