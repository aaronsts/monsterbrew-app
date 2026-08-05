import { useState } from "react";
// Named imports, not `import * as Sentry`: a namespace import here forces the
// whole SDK into the chunk that `lib/sentry.ts` lazily loads, defeating its
// tree-shaking and turning the idle load into a ~150 KB download (#155).
import { captureException, isInitialized } from "@sentry/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function RenderCrash(): never {
  throw new Error("Sentry test: render error");
}

export function SentryTest() {
  const [crashRender, setCrashRender] = useState(false);
  const initialized = isInitialized();

  if (crashRender) {
    return <RenderCrash />;
  }

  const warnIfInactive = () => {
    if (!initialized) {
      toast.warning(
        "Sentry is not initialized — the error is thrown but nothing is reported.",
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Sentry test</h1>
        <p className="mt-1 text-muted-foreground">
          Each button triggers one error path. To actually send events from your
          machine, put <code>VITE_SENTRY_DSN</code> in <code>.env.local</code>{" "}
          and restart the dev server; they arrive tagged as{" "}
          <code>development</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Status</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              Initialized:{" "}
              <span
                className={initialized ? "text-primary" : "text-destructive"}
              >
                {initialized ? "yes" : "no"}
              </span>
            </li>
            <li>DSN: {import.meta.env.VITE_SENTRY_DSN ? "set" : "not set"}</li>
            <li>Mode: {import.meta.env.MODE}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Trigger a test error</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            color="destructive"
            onClick={() => {
              warnIfInactive();
              setCrashRender(true);
            }}
          >
            Render error
          </Button>
          <Button
            color="destructive"
            variant="light"
            onClick={() => {
              warnIfInactive();
              throw new Error("This is your first error!");
            }}
          >
            Event handler error
          </Button>
          <Button
            color="destructive"
            variant="outline"
            onClick={() => {
              warnIfInactive();
              void Promise.reject(
                new Error("Sentry test: unhandled promise rejection"),
              );
            }}
          >
            Unhandled rejection
          </Button>
          <Button
            color="neutral"
            variant="outline"
            onClick={() => {
              const eventId = captureException(
                new Error("Sentry test: manual capture"),
              );
              if (initialized) {
                toast.success(`captureException sent (event ${eventId})`);
              } else {
                toast.warning(
                  "Sentry is not initialized — nothing was reported.",
                );
              }
            }}
          >
            Manual capture
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
