
"use client";

import type { PlaySignUp, PlaySlotConfig } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, UserMinus, Loader2, Trash2 } from 'lucide-react'; // Added Trash2
import { maxParticipantsPerPlaySlot } from '@/config/appConfig';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface AulaSlotDisplayProps {
  slotConfig: PlaySlotConfig;
  date: string; // YYYY-MM-DD (for logic)
  displayDate: string; // dd/MM (for display in title)
  allSignUps: PlaySignUp[]; // Todas as inscrições para filtrar
  hasStarted: boolean;
}

export function AulaSlotDisplay({ slotConfig, date, displayDate, allSignUps, hasStarted }: AulaSlotDisplayProps) {
  const { currentUser, isAdmin, signUpForPlaySlot, cancelPlaySlotSignUp, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpToRemove, setSignUpToRemove] = useState<PlaySignUp | null>(null);
  const [wantsExperimental, setWantsExperimental] = useState(false);
  const router = useRouter();


  const relevantSignUps = allSignUps.filter(
    (signUp) => signUp.slotKey === slotConfig.key && signUp.date === date
  );

  const currentUserSignUp = relevantSignUps.find(
    (signUp) => signUp.userId === currentUser?.id
  );

  const isSlotFull = relevantSignUps.length >= maxParticipantsPerPlaySlot;

  useEffect(() => {
    if (currentUserSignUp) {
      setWantsExperimental(currentUserSignUp.isExperimental ?? false);
    } else {
      setWantsExperimental(false);
    }
  }, [currentUserSignUp]);

  const handleSignUp = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      const startTime = slotConfig.timeRange.split(' - ')[0];
      await signUpForPlaySlot(
        slotConfig.key,
        date,
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
        },
        {
          time: startTime,
          isExperimental: wantsExperimental,
        }
      );
    } catch (error) {
      console.error("Erro no handleSignUp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCurrentUserSignUp = async () => {
    if (!currentUserSignUp) return;
    setIsSubmitting(true);
    try {
      await cancelPlaySlotSignUp(currentUserSignUp.id);
    } catch (error) {
      console.error("Erro no handleCancelCurrentUserSignUp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminRemoveSignUp = async (signUpId: string) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      await cancelPlaySlotSignUp(signUpId);
      setSignUpToRemove(null); // Close dialog
    } catch (error) {
      console.error("Erro no handleAdminRemoveSignUp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInitials = (name: string = "") => {
    const nameParts = name.split(' ');
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0].substring(0,2).toUpperCase();
    return nameParts
      .map(n => n[0])
      .filter(Boolean) 
      .join('')
      .toUpperCase();
  };

  return (
    <>
    <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{slotConfig.label} - {displayDate}</CardTitle>
            {hasStarted && <Badge variant="destructive">Horário encerrado</Badge>}
          </div>
          <CardDescription
            onClick={() => {
              if (!hasStarted) {
                if (!currentUser) {
                  router.push('/login');
                } else if (!currentUserSignUp && !isSlotFull && !isSubmitting && !authLoading) {
                  handleSignUp();
                }
              }
            }}
            className={hasStarted ? "text-muted-foreground" : "cursor-pointer hover:underline"}
          >
            {slotConfig.timeRange}
          </CardDescription>
        </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-primary flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Participantes ({relevantSignUps.length}/{maxParticipantsPerPlaySlot})
            </h4>
            {isSlotFull && !currentUserSignUp && (
                <span className="text-sm font-medium text-destructive">Vagas Esgotadas!</span>
            )}
          </div>
          {relevantSignUps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relevantSignUps.map((signUp) => (
                <div key={signUp.id} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                          src={`https://placehold.co/40x40.png?text=${getInitials(signUp.userName)}`}
                          alt={signUp.userName}
                          data-ai-hint="avatar perfil"
                      />
                      <AvatarFallback>{getInitials(signUp.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm truncate" title={signUp.userName}>{signUp.userName}</span>
                      {signUp.isExperimental && (
                        <Badge variant="outline" className="mt-1 w-fit text-[10px] uppercase tracking-wide">
                          Experimental
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isAdmin && currentUser?.id !== signUp.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setSignUpToRemove(signUp)}
                      aria-label={`Remover ${signUp.userName} desta sessão`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ninguém inscrito ainda. Seja o primeiro!</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
          {!currentUser ? (
            <Button asChild className="w-full">
              <Link href="/login">
                <UserPlus className="mr-2" />
                Faça login para se inscrever
              </Link>
            </Button>
          ) : currentUserSignUp ? (
            <>
              <Button
                variant="destructive"
                onClick={handleCancelCurrentUserSignUp}
                disabled={isSubmitting || authLoading}
                className="w-full"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <UserMinus className="mr-2" />}
                Cancelar Minha Inscrição
              </Button>
              {currentUserSignUp.isExperimental && (
                <p className="w-full text-center text-sm text-muted-foreground">
                  Esta inscrição está marcada como aula experimental.
                </p>
              )}
            </>
          ) : hasStarted ? (
            <Button disabled className="w-full">
              Horário Encerrado
            </Button>
          ) : isSlotFull ? (
            <Button disabled className="w-full">
              Vagas Esgotadas
            </Button>
          ) : (
            <>
              <div className="flex w-full items-start gap-2 rounded-md border border-dashed border-border/60 bg-muted/20 p-3">
                <Checkbox
                  id={`experimental-${slotConfig.key}-${date}`}
                  checked={wantsExperimental}
                  onCheckedChange={(checked) => setWantsExperimental(checked === true)}
                  disabled={isSubmitting || authLoading}
                  aria-label="Marcar inscrição como aula experimental"
                />
                <div className="space-y-1 text-left">
                  <Label htmlFor={`experimental-${slotConfig.key}-${date}`} className="text-sm font-medium leading-none">
                    Marcar como aula experimental
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ideal para a primeira participação. Não conta no limite semanal de treinos.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignUp}
                disabled={isSubmitting || authLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2" />}
                {wantsExperimental ? 'Reservar Aula Experimental' : 'Inscrever-se na Aula'}
              </Button>
            </>
          )}
        </CardFooter>
    </Card>

    {isAdmin && signUpToRemove && (
        <AlertDialog open={!!signUpToRemove} onOpenChange={() => setSignUpToRemove(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                <AlertDialogDescription>
                    Você tem certeza que deseja remover <span className="font-semibold">{signUpToRemove.userName}</span> da sessão "{slotConfig.label} - {displayDate}"?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSignUpToRemove(null)} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => handleAdminRemoveSignUp(signUpToRemove.id)} 
                    disabled={isSubmitting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sim, Remover
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}
