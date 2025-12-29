import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Moon, Star, Sparkles, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You've successfully logged in." : "Your account has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AuthFormValues) => {
    authMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative z-10" data-testid="card-auth">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Moon className="h-8 w-8 text-primary animate-float" />
            <Star className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-auth-title">
            Eunoia
          </CardTitle>
          <CardDescription className="text-muted-foreground" data-testid="text-auth-description">
            {isLogin ? "Welcome back! Sign in to your journal." : "Create an account to start your journey."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-auth">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        data-testid="input-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          data-testid="input-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={authMutation.isPending}
                data-testid="button-auth-submit"
              >
                {authMutation.isPending ? (
                  "Please wait..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              data-testid="button-toggle-auth-mode"
            >
              {isLogin ? "Create one" : "Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
