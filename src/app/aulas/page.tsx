
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, CalendarClock, Users, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";
import { playSlotsConfig, numberOfWeeksToDisplayPlaySlots, maxParticipantsPerPlaySlot, type PlaySlotConfig } from '@/config/appConfig';
import { AulaSlotDisplay } from '@/components/aulas/AulaSlotDisplay';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, startOfDay, addDays, getDay, nextDay as dateFnsNextDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para uma instância individual de Aula
interface AulaSlotInstance {
  slotConfig: PlaySlotConfig;
  date: string; // YYYY-MM-DD para lógica
  displayDate: string; // DD/MM para exibição
  uniqueKey: string; // Para chaves React
}

// Função para gerar as próximas N datas para um dia da semana específico
const getNextOccurrences = (targetDayOfWeek: number, count: number): Array<{ date: string; displayDate: string }> => {
  const occurrences: Array<{ date: string; displayDate: string }> = [];
  let currentDate = startOfDay(new Date()); // Começa de hoje

  // Ajusta currentDate para ser a primeira ocorrência (hoje ou no futuro)
  // Se hoje NÃO é o targetDayOfWeek, avança para o próximo targetDayOfWeek
  if (getDay(currentDate) !== targetDayOfWeek) {
    currentDate = dateFnsNextDay(currentDate, targetDayOfWeek);
  }
  // Se hoje JÁ é o targetDayOfWeek, currentDate permanece como hoje (início do dia).
  // O filtro principal de horário decidirá se a sessão de hoje ainda é válida.

  for (let i = 0; i < count; i++) {
    if (i > 0) { // Para ocorrências subsequentes, encontre a próxima
      currentDate = dateFnsNextDay(currentDate, targetDayOfWeek);
    }
    occurrences.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      displayDate: format(currentDate, 'dd/MM', { locale: ptBR })
    });
  }
  return occurrences;
};


function AulasPage() {
  const { playSignUps, isLoading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chronologicallySortedPlaySlots = useMemo(() => {
    const now = new Date(); // Hora atual no fuso horário do cliente
    const allUpcomingSlots: AulaSlotInstance[] = [];

    playSlotsConfig.forEach(slot => {
      const occurrences = getNextOccurrences(slot.dayOfWeek, numberOfWeeksToDisplayPlaySlots);
      const startTime = slot.timeRange.split(' - ')[0]; // ex: "16:00"

      occurrences.forEach(occ => {
        // occ.date é "YYYY-MM-DD"
        const playSessionStartDateTime = new Date(`${occ.date}T${startTime}:00`);
        // Este objeto Date está no fuso horário do cliente, interpretando a string como local.

        if (now < playSessionStartDateTime) { // A sessão só é incluída se a hora atual for ANTES do início da sessão
          allUpcomingSlots.push({
            slotConfig: slot,
            date: occ.date,
            displayDate: occ.displayDate,
            uniqueKey: `${slot.key}-${occ.date}`
          });
        }
      });
    });

    // Ordenar cronologicamente com base na data e hora de início reais
    allUpcomingSlots.sort((a, b) => {
        const startTimeA = a.slotConfig.timeRange.split(' - ')[0];
        const startTimeB = b.slotConfig.timeRange.split(' - ')[0];
        const dateTimeA = new Date(`${a.date}T${startTimeA}:00`);
        const dateTimeB = new Date(`${b.date}T${startTimeB}:00`);
        return dateTimeA.getTime() - dateTimeB.getTime();
    });
    
    return allUpcomingSlots;

  }, [playSignUps]); // Recalcula se playSignUps mudar (indicando potencial mudança de estado ou re-render)


  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Participe das nossas Aulas na Fúria Treinamentos!
          </h1>
        </div>
        <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
          Nossas aulas acontecem diariamente (das {playSlotsConfig[0].timeRange}) com vagas limitadas ({maxParticipantsPerPlaySlot} por horário). Garanta sua presença e evolua no futevôlei com a gente.
        </p>
      </header>

      <section id="upcoming-aulas" className="space-y-8 scroll-mt-20">
        <h2 className="text-3xl font-semibold text-primary text-center mb-8 flex items-center justify-center gap-2">
          <CalendarDays className="mr-2 h-8 w-8" /> Próximas Aulas
        </h2>

        {authLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-60 w-full rounded-lg" />)}
          </div>
        )}

        {!authLoading && chronologicallySortedPlaySlots.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {chronologicallySortedPlaySlots.map(slotInstance => (
              <AulaSlotDisplay
                key={slotInstance.uniqueKey}
                slotConfig={slotInstance.slotConfig}
                date={slotInstance.date} // YYYY-MM-DD
                displayDate={slotInstance.displayDate} // DD/MM
                allSignUps={playSignUps}
              />
            ))}
          </div>
        )}

         {!authLoading && chronologicallySortedPlaySlots.length === 0 && (
            <Card className="text-center py-10">
                <CardContent>
                    <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl font-medium text-muted-foreground">Nenhuma aula agendada para as próximas semanas.</p>
                    <p className="text-muted-foreground mt-2">Por favor, verifique novamente mais tarde ou entre em contato.</p>
                </CardContent>
            </Card>
        )}
      </section>

      <Separator className="my-12" />

      <Card className="shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <ListChecks className="mr-2 h-6 w-6" />
            Como Funcionam as Aulas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/80">
           <div>
            <h3 className="font-semibold text-primary mb-1">Agenda e Horários Fixos</h3>
            <p>
              As aulas acontecem diariamente, das {playSlotsConfig[0].timeRange}. Veja as datas disponíveis acima e inscreva-se!
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Inscrição Individual</h3>
            <p>
              As vagas são limitadas a {maxParticipantsPerPlaySlot} participantes por aula para garantir uma ótima experiência e evolução. Faça sua inscrição individualmente através desta página para garantir sua vaga. É necessário estar logado.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Formato das Aulas</h3>
            <p>
              Durante as aulas, realizadas na quadra da arena, os treinos são conduzidos de forma orientada pelo instrutor, focando em técnica e prática do futevôlei.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Exclusividade dos Horários</h3>
            <p>
               Os horários das aulas (das {playSlotsConfig[0].timeRange}) são exclusivos para esta modalidade. Durante esses períodos, a quadra da arena é reservada para as aulas e não estará disponível para aluguel avulso, garantindo o espaço para os participantes inscritos.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <section className="text-center mt-12 py-10 bg-gradient-to-r from-primary/5 via-background to-background rounded-lg shadow-sm border border-border/50">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Pronto para treinar?
        </h2>
        <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
          Não perca tempo! Verifique as datas disponíveis acima e garanta sua vaga nas próximas aulas. Estamos te esperando!
        </p>
        {isClient ? (
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-shadow" asChild>
            <Link href="#upcoming-aulas">
              <CalendarClock className="mr-2 h-5 w-5" />
              Ver Aulas e Inscrever-se
            </Link>
          </Button>
        ) : (
           <div className="h-11 w-64 rounded-md bg-muted opacity-50 mx-auto" />
        )}
      </section>
    </div>
  );
}

export default AulasPage;

    
