import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VendorProfile, CATEGORY_LABELS, VendorCategory } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Phone, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Vendors() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');

  useEffect(() => {
    loadVendors();
  }, [searchParams]);

  const loadVendors = async () => {
    setLoading(true);
    let query = supabase
      .from('vendor_profiles')
      .select('*')
      .eq('is_verified', true);

    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query.order('rating_average', { ascending: false });

    if (!error && data) {
      setVendors(data);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Find Service Providers</h1>
          <p className="text-muted-foreground">Browse verified vendors in your area</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by business name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="md:flex-1"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No vendors found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                <CardContent className="p-6">
                  {vendor.business_image_url && (
                    <img
                      src={vendor.business_image_url}
                      alt={vendor.business_name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{vendor.business_name}</h3>
                      <Badge variant="secondary">{CATEGORY_LABELS[vendor.category]}</Badge>
                    </div>

                    {vendor.description && (
                      <p className="text-muted-foreground line-clamp-2">{vendor.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{vendor.rating_average.toFixed(1)}</span>
                        <span className="text-muted-foreground">({vendor.total_reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phone_number}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
