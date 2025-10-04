import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorProfile, BookingRequest, Service } from '@/types/database';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, CircleCheck as CheckCircle, Circle as XCircle, CreditCard as Edit } from 'lucide-react';
import { toast } from 'sonner';
import { ManageServicesDialog } from './ManageServicesDialog';
import { EditVendorProfileDialog } from './EditVendorProfileDialog';

interface BookingWithUser extends BookingRequest {
  user_profiles: {
    full_name: string;
    phone_number?: number;
  };
}

export function VendorDashboard() {
  const { user } = useAuth();
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesDialogOpen, setServicesDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVendorData();
    }
  }, [user]);

  const loadVendorData = async () => {
    if (!user) return;

    const [vendorRes, bookingsRes, servicesRes] = await Promise.all([
      supabase.from('vendor_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('booking_requests')
        .select('*, user_profiles(full_name, phone_number)')
        .eq('vendor_id', vendorRes.data?.id || '')
        .order('created_at', { ascending: false }),
      supabase.from('services').select('*').eq('vendor_id', vendorRes.data?.id || ''),
    ]);

    if (vendorRes.data) setVendorProfile(vendorRes.data);
    if (bookingsRes.data) setBookings(bookingsRes.data as BookingWithUser[]);
    if (servicesRes.data) setServices(servicesRes.data);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: 'accepted' | 'rejected' | 'completed') => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking');
    } else {
      toast.success(`Booking ${status}`);
      loadVendorData();
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithUser }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.user_profiles.full_name}</CardTitle>
            {booking.user_profiles.phone_number && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{booking.user_profiles.phone_number}</span>
              </div>
            )}
          </div>
          <Badge>{booking.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(booking.booking_date), 'PPP')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{booking.booking_time}</span>
        </div>
        {booking.message && (
          <div className="text-sm">
            <span className="font-medium">Message:</span>
            <p className="text-muted-foreground mt-1">{booking.message}</p>
          </div>
        )}
        {booking.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'accepted')}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'rejected')}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
        {booking.status === 'accepted' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => updateBookingStatus(booking.id, 'completed')}
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vendorProfile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">You don't have a vendor profile yet</p>
          <Button onClick={() => {}}>Create Vendor Profile</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {bookings.filter((b) => b.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vendorProfile.rating_average.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{vendorProfile.total_reviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setProfileDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button variant="outline" onClick={() => setServicesDialogOpen(true)}>
          Manage Services
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {bookings.filter((b) => b.status === 'pending').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {bookings.filter((b) => b.status === 'accepted').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {bookings.filter((b) => b.status === 'completed').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>

      {vendorProfile && (
        <>
          <ManageServicesDialog
            open={servicesDialogOpen}
            onOpenChange={setServicesDialogOpen}
            vendorId={vendorProfile.id}
            services={services}
            onServicesUpdated={loadVendorData}
          />
          <EditVendorProfileDialog
            open={profileDialogOpen}
            onOpenChange={setProfileDialogOpen}
            vendorProfile={vendorProfile}
            onProfileUpdated={loadVendorData}
          />
        </>
      )}
    </div>
  );
}
