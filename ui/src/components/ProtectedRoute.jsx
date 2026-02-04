import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
  children,
  requireCompanyAssociation = false,
  requireEmployee = false,
  requireCanManageCargo = false
}) => {
  const {
    isAuthenticated,
    employeeRecords,
    getAssociatedCompanyIds,
    canManageCargo
  } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const associatedCompanyIds = getAssociatedCompanyIds();
  const hasCompanyAssociation = associatedCompanyIds.length > 0;
  const isEmployee = employeeRecords.length > 0;
  const canCreateCargo = associatedCompanyIds.some(companyId => canManageCargo(companyId));

  // Check if user is associated with at least one company
  if (requireCompanyAssociation && !hasCompanyAssociation) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user is an employee of at least one company
  if (requireEmployee && !isEmployee) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user can manage cargo (Admin or Office employee)
  if (requireCanManageCargo && !canCreateCargo) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
