
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courts } from '@/config/appConfig';
import { CourtCard } from '@/components/courts/CourtCard';
import { AvailabilityCalendar } from '@/components/courts/AvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedDatesByCourt, setSelectedDatesByCourt] = useState<Record<string, Date | undefined>>({});
  const [activeCourtIndex, setActiveCourtIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDateSelect = (courtId: string, date?: Date) => {
    setSelectedDatesByCourt((prev) => ({ ...prev, [courtId]: date }));
  };

  const handlePrevCourt = () => {
    setActiveCourtIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextCourt = () => {
    setActiveCourtIndex((prev) => Math.min(prev + 1, courts.length - 1));
  };

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
              Confira os horários e garanta sua vaga.
            </p>
            {courts.length > 1 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Use as setas para navegar entre as unidades disponíveis.
              </p>
            )}
          </div>
          <div className="relative mx-auto max-w-3xl">
            {courts.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevCourt}
                disabled={activeCourtIndex === 0}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-background shadow-sm disabled:opacity-40"
                aria-label="Ver quadra anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeCourtIndex * 100}%)` }}
              >
                {courts.map((court) => (
                  <div key={court.id} className="w-full flex-shrink-0 px-4">
                    <div className="flex flex-col items-center space-y-6">
                      <CourtCard court={court} className="w-full" />
                      <AvailabilityCalendar
                        court={court}
                        className="w-full"
                        currentSelectedDate={selectedDatesByCourt[court.id]}
                        onDateSelect={(date) => handleDateSelect(court.id, date)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {courts.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextCourt}
                disabled={activeCourtIndex === courts.length - 1}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border border-border bg-background shadow-sm disabled:opacity-40"
                aria-label="Ver próxima quadra"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
