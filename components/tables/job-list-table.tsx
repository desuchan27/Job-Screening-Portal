"use client";

import { useState } from "react";
import { Job } from "@/types/job";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/buttons/button";
import { Edit2Icon, ChevronLeft, ChevronRight, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getEffectiveJobStatus,
  JOB_FILTER_TABS,
  JOB_SORT_OPTIONS,
  JobSortOption,
} from "@/lib/job-utils";
import {
  TableContainer,
  TableHeader,
} from "@/components/container/table-container";
import { TabButton } from "@/components/buttons/tab-button";
import { SortButton } from "@/components/buttons/sort-button";
import { Input } from "@/components/forms/input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

type JobListTableProps = {
  jobs: Array<
    Job & {
      applicationCount: number;
      updatedBy: string;
    }
  >;
};

export function JobListTable({ jobs }: JobListTableProps) {
  const router = useRouter();
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<JobSortOption>("latest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  // Handle sort button click - toggle direction if same sort, otherwise set new sort
  const handleSortChange = (newSort: JobSortOption) => {
    if (sortBy === newSort) {
      // Toggle direction if clicking the same sort
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort with default direction
      setSortBy(newSort);
      setSortDirection(newSort === "title" ? "asc" : "desc");
    }
  };

  // Filter jobs based on effective status and search term
  const filteredJobs = jobs.filter((job) => {
    const effectiveStatus = getEffectiveJobStatus(job);

    // Search filter
    if (
      searchTerm &&
      !job.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter === "All") return true;

    // For DRAFT, ACTIVE, CLOSED, ARCHIVED - match the effective status
    return effectiveStatus === statusFilter;
  });

  // Sort filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "latest":
        comparison =
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        break;
      case "applicants":
        comparison = b.applicationCount - a.applicationCount;
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        return 0;
    }

    // Reverse if ascending
    return sortDirection === "asc" ? -comparison : comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  // Toggle job selection
  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TableContainer>
      {/* Search Bar */}
      <div className="px-[0.875rem] pt-[0.875rem]">
        <Input
          type="text"
          placeholder="Search positions..."
          leftIcon={<SearchIcon className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-full"
        />
      </div>

      {/* Filter Tabs */}
      <TableHeader className="!px-[0.875rem] pt-[0.875rem] !pb-[0.875rem] flex flex-row justify-between items-center">
        <FilterDropdown
          options={[...JOB_FILTER_TABS]}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />
        <div className="flex items-center gap-[0.5rem]">
          <span className="text-[0.875rem] text-slate-400 mr-1">Sort by:</span>
          {JOB_SORT_OPTIONS.map((option) => {
            // Dynamic label based on sort direction
            let displayLabel: string = option.label;
            if (sortBy === option.value) {
              if (option.value === "latest") {
                displayLabel = sortDirection === "desc" ? "Latest" : "Oldest";
              } else if (option.value === "applicants") {
                displayLabel =
                  sortDirection === "desc"
                    ? "Most Applicants"
                    : "Least Applicants";
              } else if (option.value === "title") {
                displayLabel = sortDirection === "asc" ? "A-Z" : "Z-A";
              }
            }

            return (
              <SortButton
                key={option.value}
                label={displayLabel}
                isActive={sortBy === option.value}
                onClick={() => handleSortChange(option.value)}
              />
            );
          })}
        </div>
      </TableHeader>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[1rem] [&>th]:font-medium [&>th]:text-slate-600 [&>th]:px-[0.875rem] [&>th]:py-[0.875rem]">
              <th>Job Position</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Updated By</th>
              <th>Deadline</th>
              <th className="!p-0 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-[1rem] text-left font-medium [&>td]:py-[0.875rem] [&>td]:px-[0.875rem]"
              >
                <td>
                  <button
                    onClick={() => router.push(`/recruitment/${job.slug}`)}
                    className="font-semibold text-black hover:text-slate-700 hover:underline transition-colors cursor-pointer"
                  >
                    {job.title}
                  </button>
                </td>
                <td>{job.applicationCount}</td>
                <td>
                  <StatusBadge status={getEffectiveJobStatus(job)} />
                </td>
                <td>{job.updatedBy}</td>
                <td className="!text-slate-500 !font-light">
                  {formatDate(job.deadline)}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    rightIcon={<Edit2Icon className="w-4 h-4" />}
                    onClick={() => router.push(`/recruitment/${job.slug}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            {startIndex + 1}-{Math.min(endIndex, sortedJobs.length)} of{" "}
            {sortedJobs.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="sm"
              iconOnly
              rightIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outlined"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outlined"
              size="sm"
              iconOnly
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      )}
    </TableContainer>
  );
}
