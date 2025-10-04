import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Service } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface ManageServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  services: Service[];
  onServicesUpdated: () => void;
}

export function ManageServicesDialog({
  open,
  onOpenChange,
  vendorId,
  services,
  onServicesUpdated,
}: ManageServicesDialogProps) {
  const [newService, setNewService] = useState({
    service_name: '',
    description: '',
    price_range: '',
    duration: '',
  });

  const addService = async () => {
    if (!newService.service_name) {
      toast.error('Service name is required');
      return;
    }

    const { error } = await supabase.from('services').insert({
      vendor_id: vendorId,
      ...newService,
    });

    if (error) {
      toast.error('Failed to add service');
    } else {
      toast.success('Service added');
      setNewService({ service_name: '', description: '', price_range: '', duration: '' });
      onServicesUpdated();
    }
  };

  const deleteService = async (serviceId: string) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    if (error) {
      toast.error('Failed to delete service');
    } else {
      toast.success('Service deleted');
      onServicesUpdated();
    }
  };

  const toggleServiceActive = async (serviceId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: isActive })
      .eq('id', serviceId);

    if (error) {
      toast.error('Failed to update service');
    } else {
      toast.success('Service updated');
      onServicesUpdated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Services</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Add New Service</h3>
            <div className="space-y-3">
              <div>
                <Label>Service Name *</Label>
                <Input
                  value={newService.service_name}
                  onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                  placeholder="e.g., Pipe Installation"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price Range</Label>
                  <Input
                    value={newService.price_range}
                    onChange={(e) => setNewService({ ...newService, price_range: e.target.value })}
                    placeholder="e.g., $50-$100"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>
              <Button onClick={addService} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Current Services</h3>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No services yet</p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.service_name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            {service.price_range && (
                              <span className="text-primary">{service.price_range}</span>
                            )}
                            {service.duration && (
                              <span className="text-muted-foreground">{service.duration}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.is_active}
                              onCheckedChange={(checked) => toggleServiceActive(service.id, checked)}
                            />
                            <span className="text-sm text-muted-foreground">Active</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
