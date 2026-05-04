"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Briefcase,
  Clock,
  Bell,
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
  Link2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AppPage,
  PageContent,
  PageHeader,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import { SkeletonButton } from "@/components/ui/skeleton";
import { usePreferredLocale } from "@/components/format/time-ago";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { JobDescription } from "@/types";

const CalendarSyncButton = dynamic(
  () => import("@/components/google").then((m) => m.CalendarSyncButton),
  { loading: () => <SkeletonButton className="w-32" />, ssr: false },
);

interface Reminder {
  id: string;
  jobId: string;
  type: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "interview" | "deadline" | "reminder";
  job?: JobDescription;
  reminder?: Reminder;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EVENT_COLORS = {
  interview: "bg-primary",
  deadline: "bg-destructive",
  reminder: "bg-info",
};

export default function CalendarPage() {
  const locale = usePreferredLocale();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [webcalUrl, setWebcalUrl] = useState("");
  const showErrorToast = useErrorToast();

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not copy calendar URL",
        fallbackDescription: "Please copy the URL manually.",
      });
    }
  };

  // Create event dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "09:00",
    jobId: "",
    type: "custom" as "follow_up" | "interview" | "deadline" | "custom",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/reminders").then((r) => r.json()),
      fetch("/api/calendar/feed-url?type=all").then((r) => r.json()),
    ])
      .then(([jobsData, remindersData, feedData]) => {
        setJobs(jobsData.jobs || []);
        setReminders(remindersData.reminders || []);
        setFeedUrl(feedData.feedUrl || "");
        setWebcalUrl(feedData.webcalUrl || "");
      })
      .catch((error) => {
        showErrorToast(error, {
          title: "Could not load calendar",
          fallbackDescription: "Please refresh the page and try again.",
        });
      })
      .finally(() => setLoading(false));
  }, [showErrorToast]);

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Interview events
    jobs
      .filter((j) => j.status === "interviewing" && j.appliedAt)
      .forEach((job) => {
        allEvents.push({
          id: `interview-${job.id}`,
          title: `Interview: ${job.title}`,
          date: new Date(job.appliedAt!),
          type: "interview",
          job,
        });
      });

    // Deadline events
    jobs
      .filter((j) => j.deadline)
      .forEach((job) => {
        allEvents.push({
          id: `deadline-${job.id}`,
          title: `Deadline: ${job.title}`,
          date: new Date(job.deadline!),
          type: "deadline",
          job,
        });
      });

    // Reminder events
    reminders
      .filter((r) => !r.completed)
      .forEach((reminder) => {
        const job = jobs.find((j) => j.id === reminder.jobId);
        allEvents.push({
          id: `reminder-${reminder.id}`,
          title: reminder.title,
          date: new Date(reminder.dueDate),
          type: "reminder",
          job,
          reminder,
        });
      });

    // Filter by type
    if (filterType !== "all") {
      return allEvents.filter((e) => e.type === filterType);
    }

    return allEvents;
  }, [jobs, reminders, filterType]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const eventDate = e.date;
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const exportCalendar = (type: string) => {
    window.location.href = `/api/calendar/export?type=${type}`;
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      description: "",
      dueDate: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      dueTime: "09:00",
      jobId: "",
      type: "custom",
    });
  };

  const openCreateDialog = () => {
    resetNewEvent();
    setShowCreateDialog(true);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.dueDate || !newEvent.jobId) return;

    setCreating(true);
    try {
      const dueDateTime = `${newEvent.dueDate}T${newEvent.dueTime}:00`;
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: newEvent.jobId,
          type: newEvent.type,
          title: newEvent.title,
          description: newEvent.description,
          dueDate: dueDateTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to create event");

      const data = await res.json();
      setReminders([...reminders, data.reminder]);
      setShowCreateDialog(false);
      resetNewEvent();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not create event",
        fallbackDescription: "Please check the event details and try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="h-10 w-10 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <AppPage>
      <PageHeader
        icon={CalendarIcon}
        eyebrow="Schedule"
        title="Calendar"
        description="Track interviews, deadlines, and reminders in one place."
        actions={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="interview">Interviews</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="gradient-bg text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <CalendarSyncButton compact />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubscribeDialog(true)}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCalendar("all")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export .ics
              </Button>
            </div>
          </div>
        }
      />

      {/* Calendar Content */}
      <PageContent>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="rounded-2xl border bg-card p-2 sm:p-6 lg:col-span-2">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="mb-2 grid grid-cols-7 gap-0 sm:gap-1">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0 sm:gap-1">
              {calendarDays.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="aspect-square" />;
                }

                const dayEvents = getEventsForDate(date);
                const isSelected =
                  selectedDate &&
                  date.getFullYear() === selectedDate.getFullYear() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getDate() === selectedDate.getDate();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`relative aspect-square min-h-11 rounded-lg p-1 text-sm transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday(date)
                          ? "bg-primary/20 font-bold"
                          : "hover:bg-muted"
                    }`}
                  >
                    <span className="block">{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[e.type]}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                Interview
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Deadline
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Reminder
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-4">
              {selectedDate
                ? new Intl.DateTimeFormat(locale, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }).format(selectedDate)
                : "Select a date"}
            </h3>

            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${EVENT_COLORS[event.type]}/20`}
                      >
                        {event.type === "interview" && (
                          <Briefcase className={`h-4 w-4 text-primary`} />
                        )}
                        {event.type === "deadline" && (
                          <AlertCircle className={`h-4 w-4 text-red-500`} />
                        )}
                        {event.type === "reminder" && (
                          <Bell className={`h-4 w-4 text-blue-500`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.job && (
                          <p className="text-xs text-muted-foreground">
                            {event.job.company}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Intl.DateTimeFormat(locale, {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(event.date)}
                        </p>
                        {event.job?.url && (
                          <a
                            href={event.job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Job
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <StandardEmptyState
                icon={CalendarIcon}
                title="No events scheduled for this day"
                className="min-h-48"
              />
            ) : (
              <StandardEmptyState
                icon={CalendarIcon}
                title="Click on a date to view events"
                className="min-h-48"
              />
            )}

            {/* Upcoming Events */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3 text-sm">Upcoming Events</h4>
              {events
                .filter((e) => e.date >= new Date())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 py-2 text-sm"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${EVENT_COLORS[event.type]}`}
                    />
                    <span className="flex-1 truncate">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, {
                        month: "short",
                        day: "numeric",
                      }).format(event.date)}
                    </span>
                  </div>
                ))}
              {events.filter((e) => e.date >= new Date()).length === 0 && (
                <StandardEmptyState
                  icon={CalendarIcon}
                  title="No upcoming events"
                  className="min-h-40"
                />
              )}
            </div>
          </div>
        </div>
      </PageContent>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Add a new reminder or event to your calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Follow up with recruiter"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-job">Job *</Label>
              <select
                id="event-job"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newEvent.jobId}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, jobId: e.target.value })
                }
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <select
                id="event-type"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    type: e.target.value as typeof newEvent.type,
                  })
                }
              >
                <option value="follow_up">Follow Up</option>
                <option value="interview">Interview</option>
                <option value="deadline">Deadline</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.dueDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.dueTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, dueTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                placeholder="Add notes or details..."
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createEvent}
              disabled={
                creating ||
                !newEvent.title ||
                !newEvent.dueDate ||
                !newEvent.jobId
              }
              className="gradient-bg text-primary-foreground"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Subscribe to Calendar
            </DialogTitle>
            <DialogDescription>
              Add your job search events to your favorite calendar app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Webcal Link */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Calendar Subscription URL
              </Label>
              <div className="flex gap-2">
                <Input value={feedUrl} readOnly className="text-sm font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyFeedUrl}
                  aria-label="Copy URL"
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this URL and add it to your calendar app for live updates.
              </p>
            </div>

            {/* Quick Subscribe Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Subscribe</Label>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={webcalUrl}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm font-medium"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Apple Calendar
                </a>
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Calendar
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <h4 className="text-sm font-medium">How to Subscribe</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  <span className="font-medium">Apple Calendar:</span> Click the
                  button above or add URL in File → New Calendar Subscription
                </li>
                <li>
                  <span className="font-medium">Google Calendar:</span> Click
                  the button or paste URL in Settings → Add Calendar → From URL
                </li>
                <li>
                  <span className="font-medium">Outlook:</span> Add URL in
                  Calendar → Add Calendar → Subscribe from web
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubscribeDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
