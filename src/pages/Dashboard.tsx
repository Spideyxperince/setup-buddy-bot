import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { VendorDashboard } from '@/components/dashboard/VendorDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      checkUserRole();
    }
  }, [user, authLoading]);

  const checkUserRole = async () => {
    if (!user) return;

    const [roleRes, vendorRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
      supabase.from('vendor_profiles').select('id').eq('user_id', user.id).maybeSingle(),
    ]);

    if (roleRes.data) {
      setUserRole(roleRes.data.role);
    }

    if (vendorRes.data) {
      setIsVendor(true);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {isVendor ? (
        <Tabs defaultValue="vendor" className="w-full">
          <TabsList>
            <TabsTrigger value="vendor">Vendor Dashboard</TabsTrigger>
            <TabsTrigger value="customer">My Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="vendor">
            <VendorDashboard />
          </TabsContent>
          <TabsContent value="customer">
            <CustomerDashboard />
          </TabsContent>
        </Tabs>
      ) : (
        <CustomerDashboard />
      )}
    </div>
  );
}
