"use client";

import { Calendar } from "lucide-react";
import { JobPosting } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/buttons/button";

interface JobCardProps {
  job: JobPosting;
  showApplyButton?: boolean;
  showDescription?: boolean;
  qualifications?: string[];
}

export default function JobCard({ 
  job, 
  showApplyButton = true, 
  showDescription = false,
  qualifications 
}: JobCardProps) {
  // Get current time in Philippine Time (UTC+8)
  const now = new Date();
  const phtOffset = 8 * 60; // PHT is UTC+8
  const localOffset = now.getTimezoneOffset();
  const phtTime = new Date(now.getTime() + (phtOffset + localOffset) * 60 * 1000);
  const today = new Date(phtTime.getFullYear(), phtTime.getMonth(), phtTime.getDate());
  
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const deadlineDay = deadlineDate ? new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate()) : null;
  
  // Calculate days until deadline
  const daysUntilDeadline = deadlineDay ? Math.floor((deadlineDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  const isToday = daysUntilDeadline === 0;
  const isBeforeToday = daysUntilDeadline !== null && daysUntilDeadline < 0;
  const showCountdown = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline <= 5;
  
  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No deadline";

  // isPastDeadline is true only when it's the day AFTER the deadline (daysUntilDeadline < 0)
  const isPastDeadline = isBeforeToday;

  // If job is ACTIVE but past deadline, treat it as CLOSED
  const effectiveStatus =
    job.status === "ACTIVE" && isPastDeadline ? "CLOSED" : job.status;
  const canApply = effectiveStatus === "ACTIVE";

  const displayQualifications = qualifications || job.qualifications;

  return (
    <div className="group flex flex-col relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:border-black">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={effectiveStatus} />
      </div>

      {/* Job Title */}
      <h3 className="mb-3 text-2xl font-bold text-gray-900 transition-colors pr-20">
        {job.title}
      </h3>

      {/* Description (if enabled) */}
      {showDescription && job.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {job.description}
          </p>
        </div>
      )}

      {/* Qualifications */}
      <div className="mb-4">
        {displayQualifications && displayQualifications.length > 0 ? (
          <ul className="text-gray-600 space-y-1">
            {displayQualifications.map((qual, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-accent text-sm">•</span>
                <span>{qual}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm italic">
            No qualifications listed
          </p>
        )}
      </div>

      <div className="flex flex-col mt-auto pt-[1rem] border-t border-slate-200">
        {/* Deadline */}
        <div className={`flex items-center justify-center gap-2 text-sm ${showApplyButton ? 'mb-4' : ''} mt-auto ${
          isToday ? 'text-red-600 font-bold' : 
          isBeforeToday ? 'text-gray-400 font-bold line-through' : 
          showCountdown ? 'text-orange-600 font-bold' :
          'text-gray-500'
        }`}>
          <Calendar className="w-4 h-4" />
          <span>
            Deadline: {formattedDeadline} 
            {showCountdown && (
              <span className="ml-1">
                ({isToday ? 'TODAY' : `${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`})
              </span>
            )}
          </span>
        </div>
        {/* Apply Button */}
        {showApplyButton && (
          <>
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
          </>
        )}
      </div>

      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
