
import React from 'react';
import { Card } from '@/components/ui/card';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserEditModal } from '@/components/UserEditModal';
import { UserManagementDebug } from './UserManagement/UserManagementDebug';
import { UserManagementRestricted } from './UserManagement/UserManagementRestricted';
import { UserManagementError } from './UserManagement/UserManagementError';
import { UserManagementLoading } from './UserManagement/UserManagementLoading';
import { UserManagementHeader } from './UserManagement/UserManagementHeader';
import { UserManagementTableWrapper } from './UserManagement/UserManagementTableWrapper';
import { UserDeletionDialog } from './UserManagement/UserDeletionDialog';
import { UserRenewalDialog } from './UserManagement/UserRenewalDialog';

export const UserManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    isEditModalOpen,
    setIsEditModalOpen,
    showDebugInfo,
    setShowDebugInfo,
    userToDelete,
    setUserToDelete,
    userToRenew,
    setUserToRenew,
    debugInfo,
    isLoading,
    error,
    deleteUserMutation,
    renewUserLicenseMutation,
    handleRetry,
    filteredUsers,
    handleEdit,
    handleDelete,
    handleRenew,
    confirmDelete,
    confirmRenewal,
    queryClient
  } = useUserManagement();

  const renderContent = () => {
    if (debugInfo && !debugInfo.is_admin) {
      return <UserManagementRestricted showDebugInfo={showDebugInfo} setShowDebugInfo={setShowDebugInfo} />;
    }

    if (error) {
      return <UserManagementError error={error as Error} handleRetry={handleRetry} showDebugInfo={showDebugInfo} setShowDebugInfo={setShowDebugInfo} />;
    }

    if (isLoading) {
      return <UserManagementLoading />;
    }

    return (
      <Card>
        <UserManagementHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          debugInfo={debugInfo}
          showDebugInfo={showDebugInfo}
          setShowDebugInfo={setShowDebugInfo}
        />
        <UserManagementTableWrapper
          filteredUsers={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRenew={handleRenew}
          searchTerm={searchTerm}
        />
      </Card>
    );
  };
  
  return (
    <>
      {(showDebugInfo || error) && <UserManagementDebug debugInfo={debugInfo} error={error as Error | null} />}
      
      {renderContent()}

      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          queryClient.invalidateQueries({ queryKey: ['debug-current-user'] });
        }}
      />

      <UserRenewalDialog
        user={userToRenew}
        isOpen={!!userToRenew}
        onClose={() => setUserToRenew(null)}
        onConfirm={confirmRenewal}
        isPending={renewUserLicenseMutation.isPending}
      />

      <UserDeletionDialog
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
        confirmDelete={confirmDelete}
        isPending={deleteUserMutation.isPending}
      />
    </>
  );
};
