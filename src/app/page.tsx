
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
  const [activeCourtIndex, setActiveCourtIndex] = useState(0);
  // Lifted state for globally selected date, initialized to undefined
  const [globallySelectedDate, setGloballySelectedDate] = useState<Date | undefined>(undefined);
  const hasMultipleCourts = courts.length > 1;

  const goToPreviousCourt = () => {
    setActiveCourtIndex((prevIndex) => (prevIndex === 0 ? courts.length - 1 : prevIndex - 1));
  };

  const goToNextCourt = () => {
    setActiveCourtIndex((prevIndex) => (prevIndex === courts.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sliderStyle = {
    transform: `translateX(-${activeCourtIndex * 100}%)`,
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
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Nossas Quadras
            </h2>
            <p className="mt-3 text-lg text-foreground/70">
              Confira os horários e garanta sua vaga.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-5xl">
            {hasMultipleCourts && (
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousCourt}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md backdrop-blur"
                aria-label="Ver quadra anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="overflow-hidden rounded-2xl border border-border bg-background/60 shadow-sm">
              <div className="flex transition-transform duration-300 ease-in-out" style={sliderStyle}>
                {courts.map((court) => (
                  <div key={court.id} className="w-full flex-shrink-0 px-4 py-6">
                    <div className="flex flex-col items-center space-y-6">
                      <CourtCard court={court} className="w-full max-w-3xl" />
                      <AvailabilityCalendar
                        court={court}
                        className="w-full max-w-3xl"
                        currentSelectedDate={globallySelectedDate}
                        onDateSelect={setGloballySelectedDate}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {hasMultipleCourts && (
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextCourt}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md backdrop-blur"
                aria-label="Ver próxima quadra"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
            {hasMultipleCourts && (
              <div className="mt-6 flex justify-center gap-2">
                {courts.map((court, index) => (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => setActiveCourtIndex(index)}
                    className={cn(
                      'h-2 w-8 rounded-full transition-colors',
                      index === activeCourtIndex ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-label={`Ir para ${court.name}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
