"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Briefcase,
  Clock,
  Bell,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobDescription } from "@/types";

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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_COLORS = {
  interview: "bg-purple-500",
  deadline: "bg-red-500",
  reminder: "bg-blue-500",
};

export default function CalendarPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/reminders").then((r) => r.json()),
    ])
      .then(([jobsData, remindersData]) => {
        setJobs(jobsData.jobs || []);
        setReminders(remindersData.reminders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const exportCalendar = (type: string) => {
    window.location.href = `/api/calendar/export?type=${type}`;
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
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <CalendarIcon className="h-4 w-4" />
                Schedule
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Track interviews, deadlines, and reminders in one place.
              </p>
            </div>

            {/* Export Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportCalendar("all")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export .ics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
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
                    className={`aspect-square p-1 rounded-lg text-sm transition-colors relative ${
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
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
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
                      <div className={`p-2 rounded-lg ${EVENT_COLORS[event.type]}/20`}>
                        {event.type === "interview" && (
                          <Briefcase className={`h-4 w-4 text-purple-500`} />
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
                          {event.date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
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
              <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this day
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click on a date to view events
              </p>
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
                    <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[event.type]}`} />
                    <span className="flex-1 truncate">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              {events.filter((e) => e.date >= new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
