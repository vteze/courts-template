
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { courts, playSlotsConfig } from '@/config/appConfig';
import { format, subDays, parseISO, eachDayOfInterval, isWithinInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, BarChart3, CalendarCheck, Users, ShieldAlert, UsersRound, CalendarDays as CalendarIconLucide } from 'lucide-react'; // Renamed to avoid conflict
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PlaySignUp, User } from '@/lib/types';

interface ChartData {
  name: string;
  total?: number;
  count?: number;
  [key: string]: any;
}

const DEFAULT_LEVEL_OPTIONS = ["Iniciante", "Intermediário", "Avançado", "Profissional"];

export default function AdminDashboardPage() {
  const { currentUser, isAdmin, bookings, playSignUps, totalUsers, users, updateUserPlan, updateUserLevel, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 6));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [editedPlans, setEditedPlans] = useState<Record<string, number>>({});
  const [editedLevels, setEditedLevels] = useState<Record<string, string>>({});

  const totalBookings = useMemo(() => bookings.length, [bookings]);
  const totalPlaySignUpsCount = useMemo(() => playSignUps.length, [playSignUps]);

  const levelOptions = useMemo(() => {
    const uniqueLevels = new Set(DEFAULT_LEVEL_OPTIONS);
    users.forEach((user) => {
      if (user.level) {
        uniqueLevels.add(user.level);
      }
    });
    return Array.from(uniqueLevels);
  }, [users]);

  const bookingsPerCourt: ChartData[] = useMemo(() => {
    return courts.map(court => ({
      name: court.name,
      total: bookings.filter(b => b.courtId === court.id).length,
    }));
  }, [bookings]);

  const filteredPlaySignUps = useMemo(() => {
    if (!startDate || !endDate) return playSignUps;
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    return playSignUps.filter(ps => {
       try {
        const signUpDate = parseISO(ps.date);
        return isWithinInterval(signUpDate, { start, end });
      } catch (e) {
        console.warn(`Invalid date format for Aula sign up id ${ps.id}: ${ps.date}`);
        return false;
      }
    });
  }, [playSignUps, startDate, endDate]);

  const playSignUpsLastPeriod: ChartData[] = useMemo(() => {
    if (!startDate || !endDate || !filteredPlaySignUps) return [];
    const range = eachDayOfInterval({ start: startDate, end: endDate });
    return range.map(day => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      const count = filteredPlaySignUps.filter((ps: PlaySignUp) => ps.date === formattedDay).length;
      return { name: format(day, 'dd/MM', { locale: ptBR }), count };
    });
  }, [filteredPlaySignUps, startDate, endDate]);

  const playSignUpsPerTime: ChartData[] = useMemo(() => {
    const timeOrder = Array.from(new Set(playSlotsConfig.map(slot => slot.timeRange)));
    const counts: Record<string, number> = {};
    timeOrder.forEach(time => (counts[time] = 0));
    playSignUps.forEach(ps => {
      const slot = playSlotsConfig.find(s => s.key === ps.slotKey);
      if (slot) {
        counts[slot.timeRange] = (counts[slot.timeRange] || 0) + 1;
      }
    });
    return timeOrder.map(time => ({ name: time, total: counts[time] }));
  }, [playSignUps]);

  const mostPopularCourt = useMemo(() => {
    if (bookingsPerCourt.length === 0) return "N/A";
    return bookingsPerCourt.reduce((prev, current) => (prev.total! > current.total!) ? prev : current).name;
  }, [bookingsPerCourt]);
  
  const dateRangeLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, "dd/MM/yy", { locale: ptBR })} - ${format(endDate, "dd/MM/yy", { locale: ptBR })}`;
    }
    return "Últimos 7 dias";
  }, [startDate, endDate]);

  const handlePlanChange = (userId: string, value: string) => {
    const plan = parseInt(value, 10);
    setEditedPlans((prev) => {
      const next = { ...prev };
      if (value === '' || Number.isNaN(plan)) {
        delete next[userId];
      } else {
        next[userId] = plan;
      }
      return next;
    });
  };

  const handleLevelChange = (userId: string, value: string) => {
    setEditedLevels((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSaveUserSettings = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const rawPlan = editedPlans[userId];
    const planHasValue = rawPlan !== undefined && !Number.isNaN(rawPlan);
    const currentPlan = user.planPerWeek ?? 1;
    const planToPersist = planHasValue ? rawPlan : currentPlan;
    const planChanged = planHasValue && planToPersist !== currentPlan;

    const rawLevel = editedLevels[userId];
    const currentLevelValue = user.level ?? null;
    const selectedLevelValue = rawLevel ?? (currentLevelValue ?? "not_defined");
    const levelToPersist = selectedLevelValue === "not_defined" ? null : selectedLevelValue;
    const levelChanged =
      rawLevel !== undefined
        ? currentLevelValue !== levelToPersist
        : false;

    const operations: Promise<void>[] = [];

    if (planChanged) {
      operations.push(updateUserPlan(userId, planToPersist));
    }

    if (levelChanged) {
      operations.push(updateUserLevel(userId, levelToPersist));
    }

    if (operations.length === 0) {
      return;
    }

    try {
      await Promise.all(operations);
      setEditedPlans((prev) => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
      setEditedLevels((prev) => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${userId}:`, error);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [currentUser, isAdmin, authLoading, router]);


  if (authLoading || !isClient) {
    return (
      <div className="space-y-8 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
         <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!isAdmin) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }
  
  const chartPrimaryFill = "hsl(var(--primary))"; 
  const chartAccentFill = "hsl(var(--accent))";

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Painel de Administração</h1>
          <p className="text-muted-foreground">Visão geral do sistema e métricas importantes.</p>
        </div>
         <div className="flex items-center gap-2 p-2 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
            <ShieldAlert className="h-5 w-5"/>
            <span>Modo Administrador</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary/90">Visão Geral</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">Reservas de quadra no sistema.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscrições nas Aulas</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlaySignUpsCount}</div>
              <p className="text-xs text-muted-foreground">Total de inscrições nas aulas.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quadra Mais Popular</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate" title={mostPopularCourt}>{mostPopularCourt}</div>
              <p className="text-xs text-muted-foreground">Baseado no nº total de reservas.</p>
            </CardContent>
          </Card>
           <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total de usuários registrados.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filters Section */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary/90">Filtros de Período</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIconLucide className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Data Inicial</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
                disabled={(date) => 
                  (endDate ? date > endDate : false) || 
                  date < new Date("2000-01-01")
                }
              />
            </PopoverContent>
          </Popover>
           <span className="text-muted-foreground hidden sm:inline">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIconLucide className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Data Final</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={ptBR}
                disabled={(date) =>
                  (startDate ? date < startDate : false) ||
                  date < new Date("1900-01-01") // Only very old dates as lower bound
                }
              />
            </PopoverContent>
          </Popover>
        </div>
         {(!startDate || !endDate) && <p className="text-sm text-destructive mt-2">Por favor, selecione uma data inicial e final para os gráficos de período.</p>}
      </section>

      {/* Charts Section */}
      <section className="space-y-8">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-primary/90">Atividade de Aulas</h2>
            <p className="text-sm text-muted-foreground mb-4">Exibindo dados para o período: {dateRangeLabel}</p>
            <div className="grid gap-8 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Inscrições por Horário (Total)</CardTitle>
                <CardDescription>Distribuição total de inscrições por horário das aulas.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playSignUpsPerTime}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5}/>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: chartAccentFill }}
                    />
                    <Legend wrapperStyle={{fontSize: '12px'}}/>
                    <Bar dataKey="total" fill={chartAccentFill} name="Inscrições" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Inscrições nas Aulas no Período Selecionado</CardTitle>
                <CardDescription>Volume de inscrições nas aulas no período.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={playSignUpsLastPeriod}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5}/>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                     <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: chartAccentFill }}
                    />
                    <Legend wrapperStyle={{fontSize: '12px'}}/>
                    <Line type="monotone" dataKey="count" stroke={chartAccentFill} name="Inscrições Aulas" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            </div>
        </div>
      </section>

      {/* Users Management Section */}
      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-primary/90">Usuários</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Plano (treinos/sem)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: User) => {
              const pendingPlan = editedPlans[u.id];
              const currentPlan = u.planPerWeek ?? 1;
              const pendingLevel = editedLevels[u.id];
              const currentLevelValue = u.level ?? "not_defined";
              const hasPlanChange =
                pendingPlan !== undefined &&
                !Number.isNaN(pendingPlan) &&
                pendingPlan !== currentPlan;
              const hasLevelChange =
                pendingLevel !== undefined && pendingLevel !== currentLevelValue;
              const hasChanges = hasPlanChange || hasLevelChange;

              return (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={pendingLevel ?? currentLevelValue}
                      onValueChange={(value) => handleLevelChange(u.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_defined">Não definido</SelectItem>
                        {levelOptions.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={pendingPlan ?? currentPlan}
                      onChange={(e) => handlePlanChange(u.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleSaveUserSettings(u.id)} disabled={!hasChanges}>
                      Salvar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <Card className="mt-10 shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Notas e Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><Activity className="inline h-4 w-4 mr-1"/>Os gráficos de atividade por período são baseados nos dados carregados no momento. Para histórico completo e mais performance em grandes volumes, seria necessário um backend para agregar dados do Firestore.</p>
            <p>Este dashboard pode ser expandido com mais gráficos (ex: horários de pico, taxas de cancelamento) e filtros mais avançados (ex: por tipo de quadra).</p>
        </CardContent>
      </Card>

    </div>
  );
}
