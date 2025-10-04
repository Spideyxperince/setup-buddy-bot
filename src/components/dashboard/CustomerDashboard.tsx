import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingRequest, BookingStatus } from '@/types/database';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

interface BookingWithVendor extends BookingRequest {
  vendor_profiles: {
    business_name: string;
    city: string;
    state: string;
    phone_number: number;
  };
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('booking_requests')
      .select('*, vendor_profiles(business_name, city, state, phone_number)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data as BookingWithVendor[]);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to cancel booking');
    } else {
      toast.success('Booking cancelled');
      loadBookings();
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      rejected: 'bg-red-500',
      completed: 'bg-green-500',
      cancelled: 'bg-gray-500',
    };
    return colors[status];
  };

  const filterBookings = (status?: BookingStatus) => {
    if (!status) return bookings;
    return bookings.filter((b) => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: BookingWithVendor }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{booking.vendor_profiles.business_name}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {booking.vendor_profiles.city}, {booking.vendor_profiles.state}
              </span>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelBooking(booking.id)}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
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
          {filterBookings('pending').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {filterBookings('accepted').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {filterBookings('completed').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
