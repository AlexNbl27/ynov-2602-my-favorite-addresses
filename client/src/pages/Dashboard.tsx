import { useState, useEffect, useCallback } from "react";
import { getAddresses, updateAddress, deleteAddress, type Address } from "@/services/api";
import { AddressCard } from "@/components/AddressCard";
import { AppHeader } from "@/components/AppHeader";
import { Plus, Search, MapPin, Compass, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Dashboard() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchAddresses = useCallback(async () => {
    try {
      const { items } = await getAddresses();
      setAddresses(items);
    } catch (err: any) {
      toast.error("Impossible de charger les adresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEditClick = (address: Address) => {
    setAddressToEdit(address);
    setEditName(address.name);
    setEditDescription(address.description || "");
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
  };

  const handleUpdateSubmit = async () => {
    if (!addressToEdit || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const { item } = await updateAddress(addressToEdit.id, {
        name: editName,
        description: editDescription,
      });

      setAddresses((prev) =>
        prev.map((addr) => addr.id === item.id ? item : addr)
      );

      toast.success("Adresse modifiée avec succès");
      setAddressToEdit(null);
    } catch (err) {
      toast.error("Échec de la modification de l'adresse");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAddress(addressToDelete.id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressToDelete.id));
      toast.success("Adresse supprimée");
      setAddressToDelete(null);
    } catch (err) {
      toast.error("Échec de la suppression de l'adresse");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Mes Adresses</h2>
            <p className="text-sm text-muted-foreground">
              {addresses.length} adresse{addresses.length !== 1 ? "s" : ""} sauvegardée{addresses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/search")}
              className="flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:bg-secondary m3-elevation-1"
            >
              <Compass className="h-4 w-4" />
              Proximité
            </button>
            <button
              onClick={() => navigate("/add")}
              className="flex h-10 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 m3-elevation-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="m3-card h-28 animate-pulse p-5">
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-lg bg-secondary" />
                    <div className="h-3 w-full rounded-lg bg-secondary" />
                    <div className="h-3 w-1/3 rounded-lg bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="m3-card flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Aucune adresse
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencez par ajouter votre première adresse favorite
            </p>
            <button
              onClick={() => navigate("/add")}
              className="mt-5 flex h-10 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr, i) => (
              <AddressCard
                key={addr.id}
                address={addr}
                index={i}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Address Dialog */}
      <Dialog open={!!addressToEdit} onOpenChange={(open) => !open && setAddressToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'adresse</DialogTitle>
            <DialogDescription>
              Faites des changements pour personnaliser cette adresse favorite.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Mon bureau"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Détails supplémentaires..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressToEdit(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={isUpdating || !editName.trim()}>
              {isUpdating ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!addressToDelete} onOpenChange={(open) => !open && setAddressToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex flex-row items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer l'adresse ?
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{addressToDelete?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setAddressToDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
