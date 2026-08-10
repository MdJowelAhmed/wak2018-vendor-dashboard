import { Star, MessageCircle } from "lucide-react";
import type { Service } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/utils/utils";
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
              {service.image ? (
                <img
                  src={getImageUrl(service.image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {service.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-primary inline-flex items-center gap-1">
                  <Star className="size-4 fill-current" />
                  <span className="font-medium">
                    {(service.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({service.ratingCount ?? 0} reviews)
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
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {service.description}
            </p>
          </CardContent>
        </Card>

        {service.serviceIncludes?.length ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Services We Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {service.serviceIncludes.map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {service.technologies?.length ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {service.technologies.map((t, i) => (
                  <Badge key={i} variant="outline" className="bg-muted/50">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {service.packageDetails?.length ? (
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {service.packageDetails.map((b, i) => (
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
