
import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/user';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface UserRenewalDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, days: number) => void;
  isPending: boolean;
}

export const UserRenewalDialog = ({ user, isOpen, onClose, onConfirm, isPending }: UserRenewalDialogProps) => {
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setDays(30);
    }
  }, [isOpen]);

  const { newExpirationDate, currentExpirationDateFormatted } = useMemo(() => {
    if (!user) return { newExpirationDate: null, currentExpirationDateFormatted: null };

    const currentExpiration = new Date(user.expiration_date);
    const now = new Date();
    
    const baseDate = currentExpiration < now ? now : currentExpiration;
    const newDate = addDays(baseDate, days || 0);
    
    return {
      newExpirationDate: format(newDate, 'dd/MM/yyyy', { locale: ptBR }),
      currentExpirationDateFormatted: format(currentExpiration, 'dd/MM/yyyy', { locale: ptBR }),
    };
  }, [user, days]);

  if (!user) return null;

  const handleConfirm = () => {
    onConfirm(user.id, days);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Renovar Licença do Usuário</DialogTitle>
          <DialogDescription>
            Você está prestes a renovar a licença de <strong>{user.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            A licença atual expira em: <strong>{currentExpirationDateFormatted}</strong>.
          </p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="days" className="text-right">
              Dias
            </Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="col-span-3"
              min="1"
            />
          </div>
          <p className="text-sm text-center font-semibold pt-2">
            Nova data de expiração: <span className="text-primary">{newExpirationDate}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || days <= 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Renovando...' : `Renovar por ${days} dias`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
