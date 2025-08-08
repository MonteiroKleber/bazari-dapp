import React from 'react'
import PerfilMain from './PerfilMain'
import EditProfileModal from './EditProfileModal'
import BusinessesTab from './BusinessesTab'
import ActivityTab from './ActivityTab'
import TokenTab from './TokenTab'

// ===============================
// PROFILE MODULE MAIN COMPONENT
// ===============================
const ProfileModule = () => {
  return (
    <>
      <PerfilMain />
      <EditProfileModal />
    </>
  )
}

// Export individual components for flexibility
export { 
  PerfilMain,
  EditProfileModal,
  BusinessesTab,
  ActivityTab,
  TokenTab
}

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