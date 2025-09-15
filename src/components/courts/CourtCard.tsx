
import Image from 'next/image';
import type { Court } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Asterisk, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourtCardProps {
  court: Court;
  className?: string;
}

export function CourtCard({ court, className }: CourtCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200", className)}>
      <CardHeader className="p-0">
        <div className="relative h-48 sm:h-56 md:h-64 w-full"> {/* Adjusted height for better proportion */}
          <Image
            src={court.imageUrl}
            alt={court.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={court.dataAiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="flex items-center gap-2 text-2xl mb-2">
          <Asterisk className="h-6 w-6 text-primary" />
          {court.name}
          {court.bookingDisabled && (
            <Badge variant="destructive" className="ml-1 text-xs">
              Horários esgotados
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{court.description}</CardDescription>
        {court.bookingDisabled && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Todos os horários reservados</AlertTitle>
            <AlertDescription>
              {court.bookingDisabledMessage || 'Todos os horários estão esgotados no momento nesta unidade.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

