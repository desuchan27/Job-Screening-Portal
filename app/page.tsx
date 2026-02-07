"use client";


import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Search, Filter, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/forms/input";
import { JobPosting } from "@/lib/types";

export default function Home() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState<'all' | 'available' | 'not-available'>("all");
  const [deadlineBefore, setDeadlineBefore] = useState<string>("");
  const [sortBy, setSortBy] = useState<'latest' | 'name' | 'soonest'>("latest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Handle scroll to hide/show header with hysteresis to prevent jitter
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    // Use different thresholds to prevent rapid toggling
    if (currentScrollY < 30) {
      setShowHeader(true);
    } else if (currentScrollY > 80) {
      setShowHeader(false);
    }
    // Between 30-80px: keep current state (no change)
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Search and filter logic
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by search query (job title and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        (job.qualifications && job.qualifications.some(qual => 
          qual.toLowerCase().includes(query)
        ))
      );
    }

    // Filter by experience level (semantic search in qualifications)
    if (experienceFilter.trim()) {
      const expQuery = experienceFilter.toLowerCase();
      filtered = filtered.filter(job => {
        if (!job.qualifications) return false;
        return job.qualifications.some(qual => {
          const qualLower = qual.toLowerCase();
          return qualLower.includes('experience') ||
                 qualLower.includes('year') ||
                 qualLower.includes('minimum') ||
                 qualLower.includes('preferred') ||
                 qualLower.includes('entry') ||
                 qualLower.includes('senior') ||
                 qualLower.includes('junior') ||
                 qualLower.includes('graduate') ||
                 qualLower.includes('fresh');
        }) && job.qualifications.some(qual => 
          qual.toLowerCase().includes(expQuery)
        );
      });
    }

    // Filter by deadline status
    if (deadlineStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(job => {
        const deadline = job.deadline ? new Date(job.deadline) : null;
        if (deadlineStatus === 'available') {
          return !deadline || deadline >= now;
        } else if (deadlineStatus === 'not-available') {
          return deadline && deadline < now;
        }
        return true;
      });
    }

    // Filter by deadline before
    if (deadlineBefore) {
      const beforeDate = new Date(deadlineBefore);
      filtered = filtered.filter(job => {
        if (!job.deadline) return false;
        return new Date(job.deadline) <= beforeDate;
      });
    }

    // Sort
    filtered = [...filtered];
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'soonest') {
      filtered.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else {
      // latest (default): sort by created_at descending
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [jobs, searchQuery, experienceFilter, deadlineStatus, deadlineBefore, sortBy]);

  return (
    <div className="min-h-screen bg-linear-to-b">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`mb-6 transition-all duration-500 ease-out ${showHeader ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <h1 className="text-lg md:text-4xl font-bold text-accent">
              Jobs and Opportunities
            </h1>
            <p className="md:mt-2 text-sm text-gray-600">Join our team in providing compassionate healthcare to the community of Butuan and beyond.</p>
          </div>
          
          {/* Search & Filter Section */}
          <div className="flex flex-col xl:flex-row items-end gap-4">
            <div className="flex flex-row gap-[0.5rem] w-full">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="job-search" className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <Input
                  id="job-search"
                  placeholder="e.g. nurse, pharmacy, patient care"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                  leftIcon={<Search className="w-4 h-4" />}
                  variant="search"
                  size="md"
                  showClearButton={true}
                />
              </div>
              <div className="md:w-72 flex flex-col gap-2">
                <label htmlFor="experience-filter" className="text-sm font-medium text-gray-700">
                  Filter by Experience
                </label>
                <Input
                  id="experience-filter"
                  placeholder="e.g. 1 year, fresh graduate, minimum experience"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  onClear={() => setExperienceFilter("")}
                  leftIcon={<Filter className="w-4 h-4" />}
                  variant="search"
                  size="md"
                  showClearButton={true}
                />
              </div>
            </div>
            {/* Filters: always visible on desktop, toggled on mobile */}
            <div className={`flex flex-row gap-[0.5rem] w-full overflow-x-auto ${showMobileFilters ? 'flex' : 'hidden'} xl:flex`}>
              <div className="md:w-48 flex flex-col items-start gap-1">
                <label htmlFor="deadline-status" className="text-xs text-gray-700 whitespace-nowrap">Deadline:</label>
                <select
                  id="deadline-status"
                  value={deadlineStatus}
                  onChange={e => setDeadlineStatus(e.target.value as 'all' | 'available' | 'not-available')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-accent focus:border-accent bg-white"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>
              <div className="w-full md:w-56 flex flex-col items-start gap-1">
                <label htmlFor="deadline-before" className="text-xs text-gray-700 whitespace-nowrap">Before:</label>
                <div className="w-full flex flex-row gap-[0.5rem]">
                  <input
                    id="deadline-before"
                    type="date"
                    value={deadlineBefore}
                    onChange={e => setDeadlineBefore(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-accent focus:border-accent bg-white w-full"
                  />
                  {deadlineBefore && (
                    <button onClick={() => setDeadlineBefore("")} className="ml-1 text-gray-400 hover:text-gray-600"><Calendar className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
              <div className="md:w-56 flex flex-col items-start gap-1">
                <label htmlFor="sort-by" className="text-xs text-gray-700 whitespace-nowrap">Sort by:</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'latest' | 'name' | 'soonest')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-accent focus:border-accent bg-white"
                >
                  <option value="latest">Latest published</option>
                  <option value="soonest">Soonest deadline</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
            {/* Mobile: More filters button */}
            <div className="block xl:hidden w-full">
              <button
                type="button"
                className="text-sm text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition ml-auto"
                onClick={() => setShowMobileFilters(v => !v)}
              >
                More filters
                {showMobileFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">
                Loading job postings...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-red-800 font-semibold mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No job postings available
              </h3>
              <p className="mt-2 text-gray-600">
                Check back later for new opportunities!
              </p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery || experienceFilter ? 'Search Results' : 'Available Positions'}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600">
                <span>
                  {filteredJobs.length} {filteredJobs.length === 1 ? "position" : "positions"}{" "}
                  {searchQuery || experienceFilter ? 'found' : 'currently open'}
                </span>
                {(searchQuery || experienceFilter) && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setExperienceFilter('');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            </div>

            {filteredJobs.length === 0 && (searchQuery || experienceFilter) ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <Search className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-4">
                  No jobs match your search criteria. Try adjusting your search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setExperienceFilter('');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View all jobs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-[0.5rem]">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Job Screening Portal. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
