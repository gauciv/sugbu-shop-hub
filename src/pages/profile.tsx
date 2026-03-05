import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth";
import { updateProfile } from "@/api/auth";
import { uploadProfileImage } from "@/api/storage";
import { getInitials, formatDate } from "@/lib/utils";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormValues {
  full_name: string;
  phone: string;
}

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    },
  });

  if (!profile) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const url = await uploadProfileImage(file);
      await updateProfile(profile.id, { avatar_url: url });
      await refreshProfile();
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    if (!profile) return;
    try {
      await updateProfile(profile.id, {
        full_name: values.full_name,
        phone: values.phone || undefined,
      });
      await refreshProfile();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">My Profile</h1>

      {/* Avatar section */}
      <Card className="mb-6 border-border/60 rounded-[28px] shadow-cozy">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-purple-200">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback className="bg-purple-50 text-lg font-semibold text-purple-500">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-500 text-white shadow-sm transition-colors hover:bg-purple-600 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold">{profile.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-purple-700">
              {profile.role}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="border-border/60 rounded-[28px] shadow-cozy">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register("full_name", { required: true })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                readOnly
                disabled
                className="rounded-xl bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="e.g. +63 912 345 6789"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
