
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
  const [selectedDatesByCourt, setSelectedDatesByCourt] = useState<Record<string, Date | undefined>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalCourts = courts.length;
  const normalizedIndex = totalCourts > 0 ? ((activeCourtIndex % totalCourts) + totalCourts) % totalCourts : 0;
  const currentCourt = totalCourts > 0 ? courts[normalizedIndex] : null;
  const currentSelectedDate = currentCourt ? selectedDatesByCourt[currentCourt.id] : undefined;

  const goToPreviousCourt = () => {
    if (totalCourts === 0) return;
    setActiveCourtIndex((prev) => (prev - 1 + totalCourts) % totalCourts);
  };

  const goToNextCourt = () => {
    if (totalCourts === 0) return;
    setActiveCourtIndex((prev) => (prev + 1) % totalCourts);
  };

  const handleDateSelect = (date?: Date) => {
    if (!currentCourt) return;
    setSelectedDatesByCourt((prev) => ({
      ...prev,
      [currentCourt.id]: date,
    }));
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
              Nossa Quadra
            </h2>
            <p className="mt-3 text-lg text-foreground/70">
              Confira os horários e garanta sua vaga.
            </p>
          </div>
          {currentCourt ? (
            <div className="relative mx-auto w-full max-w-5xl">
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousCourt}
                  disabled={totalCourts <= 1}
                  className="h-10 w-10 rounded-full border-muted-foreground/30 bg-background shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 sm:h-12 sm:w-12"
                  aria-label="Ver quadra anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="w-full max-w-3xl space-y-6">
                  <CourtCard court={currentCourt} className="w-full" />
                  <AvailabilityCalendar
                    court={currentCourt}
                    className="w-full"
                    currentSelectedDate={currentSelectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goToNextCourt}
                  disabled={totalCourts <= 1}
                  className="h-10 w-10 rounded-full border-muted-foreground/30 bg-background shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 sm:h-12 sm:w-12"
                  aria-label="Ver próxima quadra"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              {totalCourts > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {courts.map((court, idx) => (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => setActiveCourtIndex(idx)}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        idx === normalizedIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Ver ${court.name}`}
                      aria-current={idx === normalizedIndex ? 'true' : undefined}
                    >
                      <span className="sr-only">{court.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma quadra cadastrada no momento.</p>
          )}
        </section>
      </div>
    </>
  );
}
