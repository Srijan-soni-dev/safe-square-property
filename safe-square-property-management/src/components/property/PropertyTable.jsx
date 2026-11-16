import { Link } from "react-router-dom";
import { Eye, MapPin, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import PropertyThumb from "@/components/property/PropertyThumb";
import { Button } from "@/components/ui/button";
import { formatArea, formatDate, formatPrice } from "@/lib/format";

function Actions({ property, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon" className="h-9 w-9" title="View">
        <Link to={`/properties/${property.id}`} aria-label={`View ${property.title}`}><Eye /></Link>
      </Button>
      <Button asChild variant="ghost" size="icon" className="h-9 w-9" title="Edit">
        <Link to={`/properties/${property.id}/edit`} aria-label={`Edit ${property.title}`}><Pencil /></Link>
      </Button>
      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive" title="Delete" aria-label={`Delete ${property.title}`} onClick={() => onDelete(property)}>
        <Trash2 />
      </Button>
    </div>
  );
}

export default function PropertyTable({ properties, onDelete }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {properties.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-accent/40">
                <td className="px-4 py-3">
                  <PropertyThumb property={p} className="h-12 w-16 rounded-md" />
                </td>
                <td className="max-w-[240px] px-4 py-3">
                  <Link to={`/properties/${p.id}`} className="block truncate font-semibold hover:text-primary hover:underline">{p.title}</Link>
                  <p className="text-xs text-muted-foreground">{formatArea(p.area)} · Added {formatDate(p.created_at)}</p>
                </td>
                <td className="px-4 py-3">{p.property_type}</td>
                <td className="px-4 py-3">{p.owner_name || "—"}</td>
                <td className="max-w-[180px] truncate px-4 py-3">{p.location || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3"><Actions property={p} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y md:hidden">
        {properties.map((p) => (
          <li key={p.id} className="p-4">
            <div className="flex gap-3">
              <PropertyThumb property={p} className="h-16 w-20 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <Link to={`/properties/${p.id}`} className="block truncate font-semibold">{p.title}</Link>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" /> {p.location || "—"} · {p.property_type}
                </p>
                <p className="mt-1 text-sm font-semibold">{formatPrice(p.price)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-muted-foreground">{p.owner_name}</span>
              </div>
              <Actions property={p} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
