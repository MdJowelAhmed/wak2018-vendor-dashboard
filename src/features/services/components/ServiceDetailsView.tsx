import { Star, MessageCircle } from "lucide-react";
import type { Service } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { ServicePricingCard } from "./ServicePricingCard";

export function ServiceDetailsView({
  service,
  onEdit,
  className,
}: {
  service: Service;
  onEdit: () => void;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="border-border/60 bg-muted/20 aspect-video overflow-hidden rounded-xl border">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {service.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {service.providerName ? (
                  <span className="text-muted-foreground">
                    {service.providerName}
                  </span>
                ) : null}
                <span className="text-muted-foreground">·</span>
                <span className="text-primary inline-flex items-center gap-1">
                  <Star className="size-4 fill-current" />
                  <span className="font-medium">
                    {(service.rating ?? 4.5).toFixed(1)}
                  </span>
                </span>
                {service.category ? (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant="secondary">{service.category}</Badge>
                  </>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <ServicePricingCard service={service} onEdit={onEdit} />
      </div>

      <div className="grid w-full grid-cols-1 gap-6">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>About this service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {service.about ?? service.description}
            </p>
          </CardContent>
        </Card>

        {service.services?.length ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Services We Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {service.services.map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {service.technologies &&
        (service.technologies.frontend ||
          service.technologies.backend ||
          service.technologies.database) ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div>
                <div className="text-muted-foreground">Frontend</div>
                <div className="font-medium">
                  {service.technologies.frontend || "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Backend</div>
                <div className="font-medium">
                  {service.technologies.backend || "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Database</div>
                <div className="font-medium">
                  {service.technologies.database || "—"}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {service.benefits?.length ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Why Choose Us</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {service.benefits.map((b, i) => (
                  <li key={`${b}-${i}`}>{b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Messaging</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline">
              <MessageCircle className="mr-2 size-4" />
              Contact Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
