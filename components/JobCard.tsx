"use client";

import { Calendar } from "lucide-react";
import { JobPosting } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/buttons/button";

interface JobCardProps {
  job: JobPosting;
}

export default function JobCard({ job }: JobCardProps) {
  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No deadline";

  const isPastDeadline = job.deadline && new Date(job.deadline) < new Date();

  // If job is ACTIVE but past deadline, treat it as CLOSED
  const effectiveStatus =
    job.status === "ACTIVE" && isPastDeadline ? "CLOSED" : job.status;
  const canApply = effectiveStatus === "ACTIVE";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-300">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={effectiveStatus} />
      </div>

      {/* Job Title */}
      <h3 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-20">
        {job.title}
      </h3>

      {/* Description */}
      <p className="mb-4 text-gray-600 line-clamp-3">{job.description}</p>

      {/* Deadline */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4" />
        <span>Deadline: {formattedDeadline}</span>
      </div>

      {/* Apply Button */}
      {canApply ? (
        <a href={`/jobs/${job.slug}/apply`} className="block">
          <Button variant="primary" className="w-full">
            Apply Now
          </Button>
        </a>
      ) : (
        <Button variant="outlined" disabled className="w-full">
          Not Available
        </Button>
      )}

      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
