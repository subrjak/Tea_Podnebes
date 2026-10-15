'use client';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import PrivateRoute from '@/shared/ui/PrivateRoute';
export default function Page() { return <PrivateRoute><ProfilePage /></PrivateRoute>; }
