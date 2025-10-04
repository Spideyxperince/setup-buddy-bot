import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Wrench, Home, Zap, Car, Hammer, Star, Shield, Clock } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { name: 'Home Services', value: 'home_services', icon: Home, color: 'bg-blue-500' },
  { name: 'Construction', value: 'construction', icon: Hammer, color: 'bg-orange-500' },
  { name: 'Electrical', value: 'home_services', icon: Zap, color: 'bg-yellow-500' },
  { name: 'Automotive', value: 'automotive', icon: Car, color: 'bg-red-500' },
  { name: 'Plumbing', value: 'home_services', icon: Wrench, color: 'bg-cyan-500' },
  { name: 'Other Services', value: 'other', icon: Star, color: 'bg-purple-500' },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Vendors',
    description: 'All service providers are verified and trusted',
  },
  {
    icon: Star,
    title: 'Rated Services',
    description: 'Check reviews and ratings from real customers',
  },
  {
    icon: Clock,
    title: 'Quick Booking',
    description: 'Book services in minutes with instant confirmation',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/vendors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/vendors');
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/vendors?category=${category}`);
  };

  return (
    <div>
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Trusted Service
            <span className="block text-primary">Providers Near You</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect with verified professionals for all your service needs. From plumbing to
            carpentry, we've got you covered.
          </p>

          <div className="flex gap-2 max-w-2xl mx-auto mt-8">
            <Input
              placeholder="Search for services (plumbing, electrical, carpentry...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12"
            />
            <Button size="lg" onClick={handleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
          <p className="text-muted-foreground">Browse services by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.value}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleCategoryClick(category.value)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className={`${category.color} p-4 rounded-full text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ServiceHub?</h2>
            <p className="text-muted-foreground">We make finding services simple and reliable</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold">Are You a Service Provider?</h2>
          <p className="text-lg opacity-90">
            Join our platform and connect with customers looking for your services
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/become-vendor')}
          >
            Become a Vendor
          </Button>
        </div>
      </section>
    </div>
  );
}
