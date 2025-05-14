import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function StripeKeyManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isEditingSecretKey, setIsEditingSecretKey] = useState(false);
  const [isEditingPublicKey, setIsEditingPublicKey] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  // Type for system config
  type SystemConfig = {
    id: number;
    key: string;
    value: string;
    description?: string;
  };
  
  // Fetch the API keys
  const { data: stripeKeys, isLoading } = useQuery<SystemConfig[]>({
    queryKey: ["/api/admin/system-config"]
  });
  
  // Effect to update state when data changes
  React.useEffect(() => {
    if (stripeKeys) {
      const secretKeyConfig = stripeKeys.find(config => config.key === "STRIPE_SECRET_KEY");
      const publicKeyConfig = stripeKeys.find(config => config.key === "STRIPE_PUBLIC_KEY");
      
      if (secretKeyConfig) {
        setSecretKey(secretKeyConfig.value);
      }
      
      if (publicKeyConfig) {
        setPublicKey(publicKeyConfig.value);
      }
    }
  }, [stripeKeys]);

  // Mutation to update the secret key
  const updateSecretKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/admin/system-config/STRIPE_SECRET_KEY`, { value: secretKey });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-config"] });
      setIsEditingSecretKey(false);
      toast({
        title: "Secret key updated",
        description: "Your Stripe secret key has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update secret key",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to update the public key
  const updatePublicKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/admin/system-config/STRIPE_PUBLIC_KEY`, { value: publicKey });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system-config"] });
      setIsEditingPublicKey(false);
      toast({
        title: "Public key updated",
        description: "Your Stripe public key has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update public key",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const cancelSecretKeyEdit = () => {
    const secretKeyConfig = stripeKeys?.find((config: any) => config.key === "STRIPE_SECRET_KEY");
    if (secretKeyConfig) {
      setSecretKey(secretKeyConfig.value);
    }
    setIsEditingSecretKey(false);
  };

  const cancelPublicKeyEdit = () => {
    const publicKeyConfig = stripeKeys?.find((config: any) => config.key === "STRIPE_PUBLIC_KEY");
    if (publicKeyConfig) {
      setPublicKey(publicKeyConfig.value);
    }
    setIsEditingPublicKey(false);
  };

  const renderSecretKeyValue = () => {
    if (isEditingSecretKey) {
      return (
        <div className="flex gap-2">
          <Input 
            type={showSecretKey ? "text" : "password"} 
            value={secretKey} 
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter your Stripe secret key (starts with sk_)"
            className="flex-1"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSecretKey(!showSecretKey)} 
            type="button"
          >
            {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {secretKey ? (showSecretKey ? secretKey : "••••••••••••••••••••••") : "Not set"}
        </span>
        {secretKey && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSecretKey(!showSecretKey)} 
            type="button"
            className="h-6 w-6"
          >
            {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
    );
  };

  const renderSecretKeyActions = () => {
    if (isEditingSecretKey) {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => updateSecretKeyMutation.mutate()}
            disabled={updateSecretKeyMutation.isPending}
          >
            {updateSecretKeyMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={cancelSecretKeyEdit}
            disabled={updateSecretKeyMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    return (
      <Button
        variant="outline"
        onClick={() => setIsEditingSecretKey(true)}
      >
        {secretKey ? "Change" : "Add Key"}
      </Button>
    );
  };

  const renderPublicKeyValue = () => {
    if (isEditingPublicKey) {
      return (
        <Input 
          type="text" 
          value={publicKey} 
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="Enter your Stripe public key (starts with pk_)"
        />
      );
    }
    
    return (
      <span className="text-sm font-medium">
        {publicKey || "Not set"}
      </span>
    );
  };

  const renderPublicKeyActions = () => {
    if (isEditingPublicKey) {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => updatePublicKeyMutation.mutate()}
            disabled={updatePublicKeyMutation.isPending}
          >
            {updatePublicKeyMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={cancelPublicKeyEdit}
            disabled={updatePublicKeyMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    return (
      <Button
        variant="outline"
        onClick={() => setIsEditingPublicKey(true)}
      >
        {publicKey ? "Change" : "Add Key"}
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe API Keys</CardTitle>
        <CardDescription>
          Manage your Stripe API keys for payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Secret Key (Server-side)</Label>
              <div className="flex flex-col gap-2">
                {renderSecretKeyValue()}
                {renderSecretKeyActions()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your Stripe secret key is used server-side to create charges and manage subscriptions.
                Starts with "sk_".
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Public Key (Client-side)</Label>
              <div className="flex flex-col gap-2">
                {renderPublicKeyValue()}
                {renderPublicKeyActions()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your Stripe public key is used client-side to securely collect payment details.
                Starts with "pk_".
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}