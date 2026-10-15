'use client';
import AdminTeasPage from '@/features/admin/pages/AdminTeasPage';
import AdminRoute from '@/shared/ui/AdminRoute';
export default function Page() { return <AdminRoute inventoryOnly><AdminTeasPage /></AdminRoute>; }
