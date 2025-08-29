// Minimal ambient declarations for Deno globals to satisfy editors without Deno types configured
// NOTE: These are only for type-checking; at runtime, Supabase Edge Functions provide the real Deno API.
declare const Deno: {
  env: {
    get(name: string): string | undefined;
    set(name: string, value: string): void;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  test: (name: string, fn: () => void | Promise<void>) => void;
};
