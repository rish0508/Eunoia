import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen, Utensils, Dumbbell, Target, Image as ImageIcon, Video, Smile, Frown, Meh, ThumbsUp, ThumbsDown, X, Star, Moon, Sparkles, TrendingUp, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { entryFormSchema, dailyQuotes, type JournalEntry, type GymStatus, type Mood, type ClientEntryData, type EntryFormValues } from "@shared/schema";

const moodIcons = {
  great: ThumbsUp,
  good: Smile,
  okay: Meh,
  low: Frown,
  rough: ThumbsDown,
};

const moodColors = {
  great: "text-emerald-400 dark:text-emerald-300",
  good: "text-green-400 dark:text-green-300",
  okay: "text-amber-400 dark:text-amber-300",
  low: "text-orange-400 dark:text-orange-300",
  rough: "text-red-400 dark:text-red-300",
};

const gymStatusLabels = {
  worked_out: "Worked Out",
  rest_day: "Rest Day",
  skipped: "Skipped",
};

const gymStatusColors = {
  worked_out: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  rest_day: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  skipped: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

function getDailyQuote(date: Date): string {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="starfield">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star text-primary/40 dark:text-primary/60"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

type View = "today" | "calendar";

export default function Home() {
  const [view, setView] = useState<View>("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });

  const { data: user } = useQuery<{ id: string; username: string }>({
    queryKey: ["/api/auth/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Logged out", description: "See you next time!" });
    },
  });

  const todayEntry = entries.find((e) => isSameDay(parseISO(e.date), selectedDate));
  const dailyQuote = getDailyQuote(selectedDate);

  const handleSaveEntry = async (formData: ClientEntryData) => {
    try {
      if (editingEntry) {
        await apiRequest("PATCH", `/api/entries/${editingEntry.id}`, formData);
        toast({ title: "Entry updated", description: "Your journal entry has been saved." });
      } else {
        await apiRequest("POST", "/api/entries", formData);
        toast({ title: "Entry created", description: "Your journal entry has been saved." });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
    } catch {
      toast({ title: "Error", description: "Failed to save entry. Please try again.", variant: "destructive" });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/entries/${id}`);
      toast({ title: "Entry deleted", description: "Your journal entry has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
    } catch {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    }
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setIsDialogOpen(true);
  };

  const openEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <StarField />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />
      
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm" data-testid="header-main">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Moon className="h-6 w-6 text-primary animate-float" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-app-title">
              Eunoia
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={view === "today" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("today")}
              data-testid="button-view-today"
            >
              Today
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              data-testid="button-view-calendar"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" data-testid="button-analytics">
                <TrendingUp className="h-4 w-4 mr-1" />
                Insights
              </Button>
            </Link>
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-username">
                  <User className="h-3 w-3" />
                  {user.username}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl" data-testid="main-content">
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20" data-testid="quote-card">
          <CardContent className="py-4 px-6">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm italic text-foreground/80" data-testid="text-daily-quote">
                "{dailyQuote}"
              </p>
            </div>
          </CardContent>
        </Card>

        {view === "today" ? (
          <TodayView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            entry={todayEntry}
            onNewEntry={openNewEntry}
            onEditEntry={openEditEntry}
            onDeleteEntry={handleDeleteEntry}
            isLoading={isLoading}
          />
        ) : (
          <CalendarView
            entries={entries}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setView("today");
            }}
          />
        )}
      </main>

      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8"
        size="icon"
        onClick={openNewEntry}
        data-testid="button-new-entry"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <EntryForm
          entry={editingEntry}
          selectedDate={selectedDate}
          onSave={handleSaveEntry}
          onClose={() => setIsDialogOpen(false)}
          isOpen={isDialogOpen}
        />
      </Dialog>
    </div>
  );
}

function TodayView({
  selectedDate,
  setSelectedDate,
  entry,
  onNewEntry,
  onEditEntry,
  onDeleteEntry,
  isLoading,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  entry?: JournalEntry;
  onNewEntry: () => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  isLoading: boolean;
}) {
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="space-y-6" data-testid="view-today">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2" data-testid="text-day-label">
            <Moon className="h-3 w-3" />
            {isToday ? "Today" : format(selectedDate, "EEEE")}
          </p>
          <h2 className="text-2xl font-semibold" data-testid="text-selected-date">
            {format(selectedDate, "MMMM d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            disabled={isToday}
            data-testid="button-go-today"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
            data-testid="button-next-day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-testid="loading-skeleton">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-4" />
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      ) : entry ? (
        <EntryCard entry={entry} onEdit={onEditEntry} onDelete={onDeleteEntry} />
      ) : (
        <EmptyState onNewEntry={onNewEntry} date={selectedDate} />
      )}
    </div>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}) {
  const MoodIcon = entry.mood ? moodIcons[entry.mood as Mood] : null;

  return (
    <Card className="overflow-hidden" data-testid={`card-entry-${entry.id}`}>
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground" data-testid="text-entry-time">
              {format(parseISO(entry.date), "h:mm a")}
            </p>
            {entry.mood && MoodIcon && (
              <div className={`flex items-center gap-1 ${moodColors[entry.mood as Mood]}`} data-testid={`badge-mood-${entry.mood}`}>
                <MoodIcon className="h-4 w-4" />
                <span className="text-sm capitalize">{entry.mood}</span>
              </div>
            )}
            {entry.targetMet && (
              <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent-foreground" data-testid="badge-target-met">
                <Star className="h-3 w-3" />
                Target Met
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              data-testid="button-edit-entry"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onDelete(entry.id)}
              data-testid="button-delete-entry"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="space-y-6 pt-0">
        {entry.targetPlan && (
          <div className="space-y-2 p-4 rounded-md bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 text-accent-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Today's Target</span>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-target-plan">
              {entry.targetPlan}
            </p>
          </div>
        )}

        {entry.reflection && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Reflection</span>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-reflection">
              {entry.reflection}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {entry.gymStatus && (
            <div className="space-y-2" data-testid="section-gym">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Dumbbell className="h-4 w-4" />
                <span className="text-sm font-medium">Workout</span>
              </div>
              <div className="space-y-2">
                <Badge className={gymStatusColors[entry.gymStatus as GymStatus]} data-testid={`badge-gym-${entry.gymStatus}`}>
                  {gymStatusLabels[entry.gymStatus as GymStatus]}
                </Badge>
                {entry.gymNotes && (
                  <p className="text-sm text-foreground" data-testid="text-gym-notes">
                    {entry.gymNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {entry.food && (
            <div className="space-y-2" data-testid="section-food">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Utensils className="h-4 w-4" />
                <span className="text-sm font-medium">Food</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="text-food">
                {entry.food}
              </p>
            </div>
          )}
        </div>

        {entry.images && entry.images.length > 0 && (
          <div className="space-y-2" data-testid="section-images">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Photos</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {entry.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-md overflow-hidden bg-muted"
                >
                  <img
                    src={img}
                    alt={`Entry photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    data-testid={`img-entry-${idx}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {entry.videos && entry.videos.length > 0 && (
          <div className="space-y-2" data-testid="section-videos">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4" />
              <span className="text-sm font-medium">Videos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {entry.videos.map((vid, idx) => (
                <div
                  key={idx}
                  className="aspect-video rounded-md overflow-hidden bg-muted"
                >
                  <video
                    src={vid}
                    controls
                    className="w-full h-full object-cover"
                    data-testid={`video-entry-${idx}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ onNewEntry, date }: { onNewEntry: () => void; date: Date }) {
  const isToday = isSameDay(date, new Date());

  return (
    <Card className="border-dashed border-primary/30" data-testid="empty-state">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Moon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2" data-testid="text-empty-title">
          {isToday ? "Start your journal entry" : "No entry for this day"}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm" data-testid="text-empty-description">
          {isToday
            ? "Capture your thoughts, set your intentions, and reflect on your journey."
            : `You didn't write anything on ${format(date, "MMMM d")}.`}
        </p>
        <Button onClick={onNewEntry} data-testid="button-create-entry">
          <Sparkles className="h-4 w-4 mr-2" />
          Create Entry
        </Button>
      </CardContent>
    </Card>
  );
}

function CalendarView({
  entries,
  calendarMonth,
  setCalendarMonth,
  onSelectDate,
}: {
  entries: JournalEntry[];
  calendarMonth: Date;
  setCalendarMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
}) {
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = format(parseISO(entry.date), "yyyy-MM-dd");
    acc[dateKey] = entry;
    return acc;
  }, {} as Record<string, JournalEntry>);

  return (
    <div className="space-y-6" data-testid="view-calendar">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-calendar-month">
          <Moon className="h-5 w-5 text-primary" />
          {format(calendarMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalendarMonth(new Date())}
            data-testid="button-current-month"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card data-testid="calendar-grid">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
                data-testid={`text-weekday-${day.toLowerCase()}`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const entry = entriesByDate[dateKey];
              const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              const MoodIcon = entry?.mood ? moodIcons[entry.mood as Mood] : null;

              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDate(day)}
                  className={`
                    relative aspect-square p-1 rounded-md text-sm
                    flex flex-col items-center justify-center gap-0.5
                    transition-colors hover-elevate active-elevate-2
                    ${isCurrentMonth ? "" : "opacity-40"}
                    ${isToday ? "ring-2 ring-primary" : ""}
                    ${entry ? "bg-primary/10" : ""}
                  `}
                  data-testid={`button-calendar-day-${dateKey}`}
                  data-has-entry={entry ? "true" : "false"}
                >
                  <span className={`font-medium ${isToday ? "text-primary" : ""}`} data-testid={`text-day-number-${dateKey}`}>
                    {format(day, "d")}
                  </span>
                  {entry && (
                    <div className="flex items-center gap-0.5" data-testid={`indicator-entry-${dateKey}`}>
                      {MoodIcon && (
                        <MoodIcon className={`h-3 w-3 ${moodColors[entry.mood as Mood]}`} />
                      )}
                      {entry.targetMet && (
                        <Star className="h-3 w-3 text-accent" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap" data-testid="calendar-legend">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <span>Has Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-3 w-3 text-accent" />
          <span>Target Met</span>
        </div>
      </div>
    </div>
  );
}

function EntryForm({
  entry,
  selectedDate,
  onSave,
  onClose,
  isOpen,
}: {
  entry: JournalEntry | null;
  selectedDate: Date;
  onSave: (data: ClientEntryData) => void;
  onClose: () => void;
  isOpen: boolean;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      targetPlan: "",
      reflection: "",
      mood: "",
      gymStatus: "",
      gymNotes: "",
      food: "",
      targetMet: false,
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        targetPlan: entry.targetPlan || "",
        reflection: entry.reflection || "",
        mood: entry.mood || "",
        gymStatus: entry.gymStatus || "",
        gymNotes: entry.gymNotes || "",
        food: entry.food || "",
        targetMet: entry.targetMet || false,
      });
      setImages(entry.images || []);
      setVideos(entry.videos || []);
    } else {
      form.reset({
        targetPlan: "",
        reflection: "",
        mood: "",
        gymStatus: "",
        gymNotes: "",
        food: "",
        targetMet: false,
      });
      setImages([]);
      setVideos([]);
    }
  }, [isOpen, entry, selectedDate, form]);

  const watchGymStatus = form.watch("gymStatus");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: EntryFormValues) => {
    setIsSubmitting(true);
    
    const date = entry?.date || format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");
    
    await onSave({
      date,
      targetPlan: values.targetPlan || null,
      reflection: values.reflection || null,
      gymStatus: values.gymStatus || null,
      gymNotes: values.gymNotes || null,
      food: values.food || null,
      mood: values.mood || null,
      targetMet: values.targetMet,
      images: images.length > 0 ? images : null,
      videos: videos.length > 0 ? videos : null,
    });
    
    setIsSubmitting(false);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-entry-form">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2" data-testid="text-dialog-title">
          <Moon className="h-5 w-5 text-primary" />
          {entry ? "Edit Entry" : "New Entry"} - {format(selectedDate, "MMMM d, yyyy")}
        </DialogTitle>
        <DialogDescription data-testid="text-dialog-description">
          Record your thoughts, set your intentions, and capture memories.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-entry">
          <FormField
            control={form.control}
            name="targetPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Today's Target
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What do you want to achieve today?"
                    className="min-h-[80px] resize-none border-accent/30 focus:border-accent"
                    data-testid="input-target-plan"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reflection"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Reflection
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How was your day? What's on your mind?"
                    className="min-h-[150px] resize-none"
                    data-testid="input-reflection"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Smile className="h-4 w-4" />
                  How are you feeling?
                </FormLabel>
                <div className="flex flex-wrap gap-2" data-testid="mood-options">
                  {(["great", "good", "okay", "low", "rough"] as const).map((mood) => {
                    const MoodIcon = moodIcons[mood];
                    const isSelected = field.value === mood;
                    return (
                      <Button
                        key={mood}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(isSelected ? "" : mood)}
                        className="gap-1"
                        data-testid={`button-mood-${mood}`}
                      >
                        <MoodIcon className="h-4 w-4" />
                        <span className="capitalize">{mood}</span>
                      </Button>
                    );
                  })}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gymStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Workout
                </FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  data-testid="select-gym-status"
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-gym-trigger">
                      <SelectValue placeholder="Select workout status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="worked_out" data-testid="option-worked-out">Worked Out</SelectItem>
                    <SelectItem value="rest_day" data-testid="option-rest-day">Rest Day</SelectItem>
                    <SelectItem value="skipped" data-testid="option-skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {watchGymStatus === "worked_out" && (
            <FormField
              control={form.control}
              name="gymNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What exercises did you do?"
                      data-testid="input-gym-notes"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="food"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Food
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you eat today?"
                    className="min-h-[80px] resize-none"
                    data-testid="input-food"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetMet"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4 border-accent/30 bg-accent/5">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    Target Met
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Did you achieve your goal for today?
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-target-met"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                Photos
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" data-testid={`preview-image-${idx}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-remove-image-${idx}`}
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover-elevate">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-image-upload"
                  />
                </label>
              </div>
            </div>

            <div>
              <FormLabel className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4" />
                Videos
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {videos.map((vid, idx) => (
                  <div key={idx} className="relative w-32 h-20 rounded-md overflow-hidden group bg-muted">
                    <video src={vid} className="w-full h-full object-cover" data-testid={`preview-video-${idx}`} />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-remove-video-${idx}`}
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-32 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover-elevate">
                  <div className="flex flex-col items-center">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add video</span>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleVideoUpload}
                    className="hidden"
                    data-testid="input-video-upload"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Max 50MB per video</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-save">
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
