import { MapPin, Navigation, MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Address } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddressCardProps {
  address: Address;
  index?: number;
  onEdit?: (address: Address) => void;
  onDelete?: (address: Address) => void;
}

export function AddressCard({ address, index = 0, onEdit, onDelete }: AddressCardProps) {
  return (
    <div
      className="m3-card p-5 animate-fade-in group relative"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Menu des options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setTimeout(() => onEdit?.(address), 0)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setTimeout(() => onDelete?.(address), 0)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Supprimer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="text-base font-semibold text-foreground truncate">
            {address.name}
          </h3>
          {address.description && (
            <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">
              {address.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="h-3.5 w-3.5" />
            <span>
              {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
