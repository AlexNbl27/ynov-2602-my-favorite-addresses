import { useState } from "react";
import { searchAddresses, type Address } from "@/services/api";
import { AddressCard } from "@/components/AddressCard";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Compass, Crosshair, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SearchPage() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState("10");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [results, setResults] = useState<Address[] | null>(null);
  const [loading, setLoading] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
        toast.success("Position récupérée !");
      },
      () => toast.error("Impossible de récupérer votre position")
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { items } = await searchAddresses({
        radius: parseFloat(radius),
        from: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      setResults(items);
      if (items.length === 0) toast.info("Aucune adresse trouvée dans ce rayon");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="m3-card p-6 sm:p-8 animate-slide-up max-w-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Recherche de proximité
              </h2>
              <p className="text-sm text-muted-foreground">
                Trouvez les adresses autour d'un point
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="48.8566"
                  className="h-12 w-full rounded-2xl border border-border bg-surface-container px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="2.3522"
                  className="h-12 w-full rounded-2xl border border-border bg-surface-container px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              className="flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:bg-secondary"
            >
              <Crosshair className="h-4 w-4 text-accent" />
              Utiliser ma position
            </button>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Rayon (km)
              </label>
              <input
                type="number"
                required
                min="1"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-surface-container px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 m3-elevation-1"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  Rechercher
                  <Search className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {results !== null && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Résultats ({results.length})
            </h3>
            {results.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((addr, i) => (
                  <AddressCard key={addr.id} address={addr} index={i} />
                ))}
              </div>
            ) : (
              <div className="m3-card flex items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune adresse trouvée dans ce rayon
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
