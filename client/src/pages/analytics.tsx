import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval } from "date-fns";
import { Moon, Star, TrendingUp, Calendar, Dumbbell, Utensils, Target, Smile, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import type { JournalEntry, Mood, GymStatus } from "@shared/schema";

const moodValues: Record<Mood, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  rough: 1,
};

const moodLabels: Record<Mood, string> = {
  great: "Great",
  good: "Good",
  okay: "Okay",
  low: "Low",
  rough: "Rough",
};

export default function AnalyticsPage() {
  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/entries"],
  });

  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const sevenDaysAgo = subDays(today, 7);

  const last30DaysEntries = entries.filter((entry) => {
    const entryDate = parseISO(entry.date.split("T")[0]);
    return isWithinInterval(entryDate, { start: thirtyDaysAgo, end: today });
  });

  const last7DaysEntries = entries.filter((entry) => {
    const entryDate = parseISO(entry.date.split("T")[0]);
    return isWithinInterval(entryDate, { start: sevenDaysAgo, end: today });
  });

  const totalEntries = entries.length;
  const entriesThisMonth = last30DaysEntries.length;
  const entriesThisWeek = last7DaysEntries.length;

  const targetMetCount = last30DaysEntries.filter((e) => e.targetMet).length;
  const targetMetPercentage = entriesThisMonth > 0 ? Math.round((targetMetCount / entriesThisMonth) * 100) : 0;

  const workoutCount = last30DaysEntries.filter((e) => e.gymStatus === "worked_out").length;
  const restDayCount = last30DaysEntries.filter((e) => e.gymStatus === "rest_day").length;
  const skippedCount = last30DaysEntries.filter((e) => e.gymStatus === "skipped").length;

  const moodCounts: Record<Mood, number> = {
    great: 0,
    good: 0,
    okay: 0,
    low: 0,
    rough: 0,
  };

  last30DaysEntries.forEach((entry) => {
    if (entry.mood && entry.mood in moodCounts) {
      moodCounts[entry.mood as Mood]++;
    }
  });

  const entriesWithMood = last30DaysEntries.filter((e) => e.mood);
  const averageMood =
    entriesWithMood.length > 0
      ? entriesWithMood.reduce((sum, e) => sum + (moodValues[e.mood as Mood] || 0), 0) / entriesWithMood.length
      : 0;

  const currentStreak = (() => {
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const hasEntry = sortedEntries.some((e) => e.date.startsWith(dateStr));
      
      if (hasEntry) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else if (i === 0) {
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const weekDays = eachDayOfInterval({
    start: startOfWeek(today),
    end: endOfWeek(today),
  });

  const weeklyActivity = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const entry = entries.find((e) => e.date.startsWith(dateStr));
    return {
      day: format(day, "EEE"),
      hasEntry: !!entry,
      mood: entry?.mood as Mood | undefined,
      targetMet: entry?.targetMet,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Moon className="h-6 w-6 text-primary" />
          <span className="text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-analytics-title">
              Your Insights
            </h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-entries">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-entries">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">{entriesThisWeek} this week</p>
            </CardContent>
          </Card>

          <Card data-testid="card-current-streak">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Star className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-streak">{currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>

          <Card data-testid="card-targets-met">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Targets Met</CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-target-percentage">{targetMetPercentage}%</div>
              <Progress value={targetMetPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card data-testid="card-average-mood">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-average-mood">
                {averageMood > 0 ? averageMood.toFixed(1) : "-"}/5
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-weekly-activity">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between gap-2">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        day.hasEntry
                          ? day.targetMet
                            ? "bg-accent/20 text-accent"
                            : "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`indicator-day-${day.day}`}
                    >
                      {day.hasEntry ? (day.targetMet ? <Star className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : "-"}
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-gym-stats">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Gym Activity (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Workouts</span>
                <span className="font-medium text-green-600 dark:text-green-400" data-testid="text-workout-count">{workoutCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rest Days</span>
                <span className="font-medium text-blue-600 dark:text-blue-400" data-testid="text-rest-count">{restDayCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Skipped</span>
                <span className="font-medium text-orange-600 dark:text-orange-400" data-testid="text-skip-count">{skippedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-mood-distribution">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Mood Distribution (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["great", "good", "okay", "low", "rough"] as Mood[]).map((mood) => {
                const count = moodCounts[mood];
                const percentage = entriesWithMood.length > 0 ? (count / entriesWithMood.length) * 100 : 0;
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <span className="text-sm w-16">{moodLabels[mood]}</span>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-8" data-testid={`text-mood-count-${mood}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-food-entries">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Recent Food Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {last7DaysEntries
                .filter((e) => e.food)
                .slice(0, 5)
                .map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {format(parseISO(entry.date.split("T")[0]), "MMM d")}:
                    </span>
                    <span className="text-foreground">{entry.food}</span>
                  </div>
                ))}
              {last7DaysEntries.filter((e) => e.food).length === 0 && (
                <p className="text-sm text-muted-foreground">No food notes this week</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
