
"use client";

import { useState } from 'react';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ShieldCheck, Sun, Trash2, User, Edit3Icon, Users } from 'lucide-react'; // Added Users
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookingCancellationDialog } from './BookingCancellationDialog';
import { EditBookingDialog } from './EditBookingDialog'; 
import { useAuth } from '@/hooks/useAuth'; 

interface BookingListItemProps {
  booking: Booking;
  showUserName?: boolean;
}

export function BookingListItem({ booking, showUserName = false }: BookingListItemProps) {
  const { isAdmin } = useAuth(); 
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  const bookingDate = parseISO(booking.date);

  const handleBookingUpdated = () => {
    setIsEditDialogOpen(false);
  };

  const displayUserName = booking.onBehalfOf ? 
    `${booking.onBehalfOf} (por: ${booking.userName})` : 
    booking.userName;

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              {booking.courtType === 'covered' ? 
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> : 
                <Sun className="mr-2 h-6 w-6 text-primary" />
              }
              {booking.courtName}
            </CardTitle>
             {showUserName && booking.userName && (
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {booking.onBehalfOf ? <Users className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                {displayUserName}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{format(bookingDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{booking.time}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">ID da Reserva: {booking.id}</p>
          </CardContent>
        </div>
        <CardFooter className="pt-4 flex justify-end gap-2">
          {isAdmin && ( 
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              aria-label={`Editar reserva para ${booking.courtName} em ${format(bookingDate, "dd/MM/yyyy")} às ${booking.time}`}
            >
              <Edit3Icon className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            aria-label={`Cancelar reserva para ${booking.courtName} em ${format(bookingDate, "dd/MM/yyyy")} às ${booking.time}`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </CardFooter>
      </Card>
      {isCancelDialogOpen && (
        <BookingCancellationDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          booking={booking}
        />
      )}
      {isAdmin && isEditDialogOpen && ( 
        <EditBookingDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          booking={booking}
          onBookingUpdated={handleBookingUpdated}
        />
      )}
    </>
  );
}
