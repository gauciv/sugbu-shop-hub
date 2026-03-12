import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/api/addresses";
import { MapPin, Plus, Star, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";

interface AddressFormData {
  label: string;
  full_name: string;
  address: string;
  contact_phone: string;
}

const EMPTY_FORM: AddressFormData = { label: "Home", full_name: "", address: "", contact_phone: "" };

export default function AddressesPage() {
  const { profile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);

  useEffect(() => {
    if (!profile) return;
    getUserAddresses(profile.id).then(setAddresses).finally(() => setLoading(false));
  }, [profile?.id]);

  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, full_name: profile?.full_name ?? "" });
    setDialogOpen(true);
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      full_name: addr.full_name,
      address: addr.address,
      contact_phone: addr.contact_phone ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!profile || !form.full_name.trim() || !form.address.trim()) {
      toast.error("Name and address are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateAddress(editingId, {
          label: form.label,
          full_name: form.full_name,
          address: form.address,
          contact_phone: form.contact_phone || undefined,
        });
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Address updated");
      } else {
        const created = await createAddress(profile.id, {
          label: form.label,
          full_name: form.full_name,
          address: form.address,
          contact_phone: form.contact_phone || undefined,
        });
        setAddresses((prev) => {
          // If this is the first address, it auto-becomes default
          if (prev.length === 0) return [{ ...created, is_default: true }];
          return [created, ...prev];
        });
        toast.success("Address added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to set default");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">My Addresses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Address" : "New Address"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Home, Office"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Enter your complete address"
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.contact_phone}
                  onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                  placeholder="+63 9XX XXX XXXX"
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Address"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add a shipping address to speed up your checkout."
          action={{ label: "Add Address", onClick: openNew }}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={cn(
                "border-border/60 rounded-[20px] transition-colors",
                addr.is_default && "border-purple-300 bg-purple-50/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{addr.label}</span>
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                          <Star className="h-2.5 w-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{addr.full_name}</p>
                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                    {addr.contact_phone && (
                      <p className="text-xs text-muted-foreground">{addr.contact_phone}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!addr.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-purple-600"
                        onClick={() => handleSetDefault(addr.id)}
                        title="Set as default"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(addr)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(addr.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
