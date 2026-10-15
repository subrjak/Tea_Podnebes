'use client';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import PrivateRoute from '@/shared/ui/PrivateRoute';
export default function Page() { return <PrivateRoute><CheckoutPage /></PrivateRoute>; }
