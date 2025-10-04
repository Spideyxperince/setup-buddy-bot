import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VendorProfile, Service, Review, CATEGORY_LABELS } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BookingDialog } from '@/components/BookingDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadVendorDetails();
    }
  }, [id]);

  const loadVendorDetails = async () => {
    setLoading(true);

    const [vendorRes, servicesRes, reviewsRes] = await Promise.all([
      supabase.from('vendor_profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('services').select('*').eq('vendor_id', id).eq('is_active', true),
      supabase
        .from('reviews')
        .select('*, user_profiles(full_name)')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false }),
    ]);

    if (vendorRes.data) setVendor(vendorRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);

    setLoading(false);
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              {vendor.business_image_url && (
                <img
                  src={vendor.business_image_url}
                  alt={vendor.business_name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{vendor.business_name}</h1>
                    <Badge variant="secondary" className="mb-2">
                      {CATEGORY_LABELS[vendor.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold">{vendor.rating_average.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{vendor.total_reviews} reviews</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {vendor.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{vendor.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{vendor.address}, {vendor.city}, {vendor.state} - {vendor.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    <span>{vendor.phone_number}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-5 w-5" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{service.service_name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {service.price_range && (
                          <span className="text-primary font-medium">{service.price_range}</span>
                        )}
                        {service.duration && (
                          <span className="text-muted-foreground">{service.duration}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{review.user_profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{review.user_profiles?.full_name || 'User'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground ml-12">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <Button className="w-full" size="lg" onClick={handleBooking}>
                <Calendar className="mr-2 h-5 w-5" />
                Book Service
              </Button>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Quick and easy booking process
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {user && vendor && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          vendor={vendor}
          services={services}
          onBookingCreated={loadVendorDetails}
        />
      )}
    </div>
  );
}
