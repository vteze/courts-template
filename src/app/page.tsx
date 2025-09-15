
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courts } from '@/config/appConfig';
import { CourtCard } from '@/components/courts/CourtCard';
import { AvailabilityCalendar } from '@/components/courts/AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [currentCourtIndex, setCurrentCourtIndex] = useState(0);
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDateSelect = (courtId: string, date?: Date) => {
    setSelectedDates((prev) => ({
      ...prev,
      [courtId]: date,
    }));
  };

  const goToPrevCourt = () => {
    setCurrentCourtIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNextCourt = () => {
    setCurrentCourtIndex((prev) => Math.min(prev + 1, courts.length - 1));
  };

  const hasPrev = currentCourtIndex > 0;
  const hasNext = currentCourtIndex < courts.length - 1;

  return (
    <>
      <div className="space-y-10"> {/* Adjusted overall page spacing */}
        <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-background py-16 sm:py-20 lg:py-24 text-center shadow-inner">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"></div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl xl:text-7xl">
              Fúria Treinamentos Futevôlei
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground/80 sm:text-xl lg:text-2xl">
              Escolha o horário e inscreva-se diretamente na quadra. Simples e rápido, como deve ser.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {isClient ? (
                <>
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow">
                    <Link href="#courts-section">
                      <CalendarDays />
                      Ver Horários
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Placeholder to match server render and avoid layout shift */}
                  <div className="h-11 w-full sm:w-40 rounded-md bg-muted opacity-50" />
                  <div className="h-11 w-full sm:w-48 rounded-md bg-muted opacity-50" />
                </>
              )}
            </div>
          </div>
        </section>

        <section id="courts-section" className="space-y-10">
          <div className="text-center mb-10 sm:mb-12"> {/* Adjusted spacing */}
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Nossas Quadras
            </h2>
            <p className="mt-3 text-lg text-foreground/70">
              Confira os horários e garanta sua vaga. Use as setas laterais para navegar entre as unidades disponíveis.
            </p>
          </div>
          <div className="space-y-6">
            <div className="relative mx-auto w-full max-w-5xl">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goToPrevCourt}
                disabled={!hasPrev}
                aria-label="Ver quadra anterior"
                className={cn(
                  "absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-lg backdrop-blur transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  !hasPrev && "opacity-40"
                )}
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goToNextCourt}
                disabled={!hasNext}
                aria-label="Ver próxima quadra"
                className={cn(
                  "absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-lg backdrop-blur transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  !hasNext && "opacity-40"
                )}
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </Button>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background/80 shadow-sm">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentCourtIndex * 100}%)` }}
                >
                  {courts.map((court) => {
                    const selectedDateForCourt = selectedDates[court.id];
                    return (
                      <div key={court.id} className="w-full flex-shrink-0 px-4 py-6">
                        <div className="flex flex-col items-center space-y-6">
                          <CourtCard court={court} className="w-full max-w-3xl" />
                          <AvailabilityCalendar
                            court={court}
                            className="w-full max-w-3xl"
                            currentSelectedDate={selectedDateForCourt}
                            onDateSelect={(date) => handleDateSelect(court.id, date)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                {courts.map((court, index) => (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => setCurrentCourtIndex(index)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      index === currentCourtIndex ? "bg-primary" : "bg-muted"
                    )}
                    aria-label={`Ver ${court.name}`}
                    aria-current={index === currentCourtIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
