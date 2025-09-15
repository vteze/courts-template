"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Court, TimeSlot, PlaySlotConfig } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { availableTimeSlots, playSlotsConfig, maxParticipantsPerPlaySlot } from '@/config/appConfig';
import { BookingConfirmationDialog } from '@/components/bookings/BookingConfirmationDialog';
import { AlertCircle, CalendarX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from "@/hooks/use-toast";

interface AvailabilityCalendarProps {
  court: Court;
  className?: string;
  currentSelectedDate?: Date;
  onDateSelect: (date?: Date) => void;
}

// Helper function to check if a given time is within uma sessão de aula
function isTimeInPlaySession(date: Date, slotStartTime: string, playConfig: PlaySlotConfig[]): boolean {
  const dayOfWeek = date.getDay(); // 0 for Sunday, ..., 6 for Saturday

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const slotStartMinutes = timeToMinutes(slotStartTime);

  for (const playSlot of playConfig) {
    if (playSlot.dayOfWeek === dayOfWeek) {
      const [rangeStart, rangeEnd] = playSlot.timeRange.split(' - ');
      const rangeStartMinutes = timeToMinutes(rangeStart);
      const rangeEndMinutes = timeToMinutes(rangeEnd);

      // A slot é parte da aula se seu horário inicial estiver dentro do intervalo [início, fim)
      if (slotStartMinutes >= rangeStartMinutes && slotStartMinutes < rangeEndMinutes) {
        return true;
      }
    }
  }
  return false;
}

export function AvailabilityCalendar({
  court,
  className,
  currentSelectedDate,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const availability = court.availability ?? { status: 'available' };
  const isFullyBooked = availability.status === 'fully_booked';
  
  const { currentUser, bookings, playSignUps, isLoading: authIsLoading, signUpForPlaySlot, cancelPlaySlotSignUp } = useAuth();
  const router = useRouter();

  const getInitials = (name: string = "") => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFullyBooked) {
      setTimeSlots([]);
      setSelectedTimeSlot(null);
      return;
    }
    if (currentSelectedDate && !authIsLoading) {
      const formattedSelectedDate = format(currentSelectedDate, 'yyyy-MM-dd');
      const isToday = formattedSelectedDate === format(now, 'yyyy-MM-dd');
      const slots = availableTimeSlots.reduce<TimeSlot[]>((acc, slotTime) => {
        const isDuringPlayTime = isTimeInPlaySession(currentSelectedDate, slotTime, playSlotsConfig);
        if (!isDuringPlayTime) {
          return acc;
        }

        const isBookedByRegularBooking = bookings.some(
          (booking) =>
            booking.courtId === court.id &&
            booking.date === formattedSelectedDate &&
            booking.time === slotTime
        );
        const slotDateTime = new Date(`${formattedSelectedDate}T${slotTime}:00`);
        const isPast = isToday && slotDateTime <= now;

        acc.push({
          time: slotTime,
          isBooked: isBookedByRegularBooking,
          isPlayTime: isDuringPlayTime,
          isPast,
        });

        return acc;
      }, []);
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }, [currentSelectedDate, court.id, bookings, authIsLoading, now, isFullyBooked]);

  const handleTimeSlotClick = async (time: string, isPlay: boolean = false) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!currentSelectedDate) {
      toast({ title: "Erro", description: "Por favor, selecione uma data primeiro.", variant: "destructive" });
      return;
    }
    const slotDateTime = new Date(`${format(currentSelectedDate, 'yyyy-MM-dd')}T${time}:00`);
    if (slotDateTime <= now) {
      toast({ variant: 'destructive', title: 'Horário indisponível', description: 'Este horário já passou.' });
      return;
    }
    if (isPlay) {
      const formattedSelectedDate = format(currentSelectedDate, 'yyyy-MM-dd');
      const dayOfWeek = currentSelectedDate.getDay();
      const slotConfig = playSlotsConfig.find(
        s => s.dayOfWeek === dayOfWeek && s.timeRange.startsWith(time)
      );
      if (!slotConfig) {
        toast({ variant: 'destructive', title: 'Configuração ausente', description: 'Nenhuma configuração de horários para este dia.' });
        return;
      }
      const relevantForHour = playSignUps.filter(
        s => s.slotKey === slotConfig.key && s.date === formattedSelectedDate && s.time === time
      );
      const me = relevantForHour.find(s => s.userId === currentUser.id);
      const isFull = relevantForHour.length >= maxParticipantsPerPlaySlot;
      try {
        if (me) {
          await cancelPlaySlotSignUp(me.id);
          toast({ title: 'Inscrição removida', description: `Você saiu do horário ${time}.` });
        } else if (!isFull) {
          await signUpForPlaySlot(
            slotConfig.key,
            formattedSelectedDate,
            { userId: currentUser.id, userName: currentUser.name, userEmail: currentUser.email },
            { time }
          );
        } else {
          toast({ variant: 'destructive', title: 'Vagas esgotadas', description: `Não há vagas para ${time}.` });
        }
      } catch (e: any) {
        console.error(e);
      }
      return;
    }
    setSelectedTimeSlot(time);
    setIsDialogOpen(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isFullyBooked) {
    const blockedSlots = availability.timeSlots ?? availableTimeSlots;
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="text-xl">Verificar Disponibilidade para {court.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <CalendarX className="h-4 w-4" />
            <AlertTitle>{availability.message ?? 'Horários Esgotados'}</AlertTitle>
            <AlertDescription>
              {availability.subMessage ?? 'Todos os horários já reservados no momento.'}
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Confira os horários que já estão reservados:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {blockedSlots.map((slot) => (
                <Button
                  key={slot}
                  variant="outline"
                  disabled
                  className="h-10 cursor-not-allowed"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-xl">Verificar Disponibilidade para {court.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <Calendar
              mode="single"
              selected={currentSelectedDate}
              onSelect={onDateSelect}
              className="rounded-md border shadow-sm"
              disabled={(date) => date < today}
              locale={ptBR}
            />
          </div>
          <div className="flex-grow">
            {currentSelectedDate ? (
              <>
                <h3 className="text-lg font-semibold mb-3 text-center md:text-left">
                  Horários para {format(currentSelectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}:
                </h3>
                {authIsLoading ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableTimeSlots.map(slot => (
                      <Button key={slot} variant="outline" disabled className="animate-pulse h-10 bg-muted"></Button>
                    ))}
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {timeSlots.map(slot => {
                      let buttonVariant: "destructive" | "outline" | "default" = "outline";
                      let buttonText = slot.time;
                      let IconComponent: any = null;
                      let isDisabled = false;
                      let onClickAction = () => handleTimeSlotClick(slot.time, !!slot.isPlayTime);
                      let ariaLabel = `Reservar ${slot.time}`;

                      // Derive play slot config and enrollment state when applicable
                      const dayOfWeek = currentSelectedDate.getDay();
                      const cfg = playSlotsConfig.find(
                        (s) => s.dayOfWeek === dayOfWeek && s.timeRange.startsWith(slot.time)
                      );
                      const dateStr = format(currentSelectedDate, 'yyyy-MM-dd');
                    const playList = cfg
                      ? playSignUps.filter((su) => su.slotKey === cfg.key && su.date === dateStr && su.time === slot.time)
                      : [];
                    const meInPlay = playList.find((su) => su.userId === currentUser?.id);
                    const playFull = playList.length >= maxParticipantsPerPlaySlot;
                    const slotIsPast = Boolean(slot.isPast);

                      if (slot.isPlayTime) {
                        buttonVariant = meInPlay ? "destructive" : "outline";
                        buttonText = cfg?.timeRange ?? slot.time;
                        isDisabled = !meInPlay && (playFull || !!slot.isPast);
                        onClickAction = () => handleTimeSlotClick(slot.time, true);
                        ariaLabel = meInPlay
                          ? `Cancelar inscrição em ${cfg?.timeRange ?? slot.time}`
                          : slot.isPast
                          ? `Horário ${cfg?.timeRange ?? slot.time} indisponível`
                          : playFull
                          ? `Horário ${cfg?.timeRange ?? slot.time} esgotado`
                          : `Inscrever-se em ${cfg?.timeRange ?? slot.time}`;
                        IconComponent = null;
                      } else if (slot.isBooked || slot.isPast) {
                        buttonVariant = "destructive";
                        isDisabled = true;
                        ariaLabel = `Horário ${slot.time} indisponível`;
                      }
                      return (
                        <Button
                          key={slot.time}
                          variant={buttonVariant}
                          disabled={isDisabled}
                          onClick={onClickAction}
                          className={cn(
                            "w-full transition-colors duration-150 ease-in-out group",
                            isDisabled && 'cursor-not-allowed opacity-70',
                            !slot.isBooked && 'hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground'
                          )}
                          aria-label={ariaLabel}
                        >
                          {IconComponent && <IconComponent className="mr-1 h-4 w-4 group-hover:text-accent-foreground" />}
                          {buttonText}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center md:text-left">Nenhum horário configurado para esta data ou quadra.</p>
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Selecione uma Data</AlertTitle>
                <AlertDescription>
                  Por favor, escolha uma data no calendário para ver os horários disponíveis para esta quadra.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
      {currentSelectedDate && selectedTimeSlot && !isTimeInPlaySession(currentSelectedDate, selectedTimeSlot, playSlotsConfig) && (
        <BookingConfirmationDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          court={court}
          selectedDate={currentSelectedDate}
          selectedTime={selectedTimeSlot}
        />
      )}
      {currentSelectedDate && timeSlots.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-md font-semibold mb-2">Inscritos por horário</h4>
          <div className="space-y-3">
            {timeSlots.map(({ time: t }) => {
              const dayOfWeek = currentSelectedDate.getDay();
              const cfg = playSlotsConfig.find(s => s.dayOfWeek === dayOfWeek && s.timeRange.startsWith(t));
              const dateStr = format(currentSelectedDate, 'yyyy-MM-dd');
              const list = cfg ? playSignUps.filter(su => su.slotKey === cfg.key && su.date === dateStr && su.time === t) : [];
              const me = list.find(su => su.userId === currentUser?.id);
              const isFull = list.length >= maxParticipantsPerPlaySlot;
              const slotDateTime = new Date(`${dateStr}T${t}:00`);
              const isPast = dateStr === format(now, 'yyyy-MM-dd') && slotDateTime <= now;
              return (
                <div key={t} className="border rounded-md p-2">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => handleTimeSlotClick(t, true)}
                      className={cn(
                        "font-medium text-left hover:underline",
                        !me && (isFull || isPast) && "cursor-not-allowed opacity-70"
                      )}
                      disabled={!me && (isFull || isPast)}
                      aria-label={
                        me
                          ? `Cancelar inscrição em ${cfg?.timeRange ?? t}`
                          : isPast
                          ? `Horário ${cfg?.timeRange ?? t} indisponível`
                          : isFull
                          ? `Horário ${cfg?.timeRange ?? t} esgotado`
                          : `Inscrever-se em ${cfg?.timeRange ?? t}`
                      }
                    >
                      {cfg?.timeRange ?? t}
                    </button>
                    <Button
                      size="sm"
                      variant={me ? "destructive" : "outline"}
                      disabled={!me && (isFull || isPast)}
                      onClick={() => handleTimeSlotClick(t, true)}
                    >
                      {me ? "Cancelar" : isFull ? "Esgotado" : isPast ? "Encerrado" : "Inscrever-se"}
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground block mb-2">{list.length}/{maxParticipantsPerPlaySlot}</span>
                  {list.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {list.map(su => (
                        <div key={su.id} className="flex items-center gap-2 rounded bg-muted px-2 py-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(su.userName)}`} alt={su.userName} />
                            <AvatarFallback>{getInitials(su.userName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm leading-tight" title={su.userName}>{su.userName}</span>
                            {su.isExperimental && (
                              <Badge variant="outline" className="mt-0.5 w-fit text-[10px] uppercase tracking-wide">
                                Experimental
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem inscritos ainda.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

