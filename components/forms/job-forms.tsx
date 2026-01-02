"use client";

import { createJob } from "@/server/job";
import { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "../buttons/button";
import {
  Loader2,
  Sparkles,
  Trash2,
  Plus,
  Pencil,
  Check,
  ArrowRight,
  X,
  PlusIcon,
  Table,
} from "lucide-react";
import {
  TableBody,
  TableContainer,
  TableHeader,
} from "@/components/container/table-container";
import { Tag } from "@/components/ui/tag";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Separator from "../layout/separator";
import { Switch } from "../buttons/switch";
import { getJobBySlug, updateJob, deleteJob } from "@/server/job";

export function NewJobForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    qualifications: [] as string[],
    mandatoryCriteria: [] as string[],
    softSkills: [] as string[],
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track if form has any data (unsaved changes)
  useEffect(() => {
    const hasData =
      formData.title.trim() !== "" ||
      formData.description.trim() !== "" ||
      formData.qualifications.length > 0 ||
      formData.mandatoryCriteria.length > 0 ||
      formData.softSkills.length > 0 ||
      formData.deadline !== "";

    setHasUnsavedChanges(hasData && !success);
  }, [formData, success]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [qualificationInput, setQualificationInput] = useState("");

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, qualificationInput.trim()],
      }));
      setQualificationInput("");
    }
  };

  const [editingQualificationIndex, setEditingQualificationIndex] = useState<
    number | null
  >(null);
  const [editingQualificationValue, setEditingQualificationValue] =
    useState("");

  const handleEditQualification = (index: number) => {
    setEditingQualificationIndex(index);
    setEditingQualificationValue(formData.qualifications[index]);
  };

  const handleSaveQualification = (index: number) => {
    if (editingQualificationValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: prev.qualifications.map((qual, i) =>
          i === index ? editingQualificationValue.trim() : qual
        ),
      }));
    }
    setEditingQualificationIndex(null);
    setEditingQualificationValue("");
  };

  const handleRemoveQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateAI = () => {
    console.log("Generated with AI! 🤖✨");
  };

  const [mandatoryCriteriaInput, setMandatoryCriteriaInput] = useState("");

  const handleAddMandatoryCriteria = () => {
    if (mandatoryCriteriaInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        mandatoryCriteria: [
          ...prev.mandatoryCriteria,
          mandatoryCriteriaInput.trim(),
        ],
      }));
      setMandatoryCriteriaInput("");
    }
  };

  const handleRemoveMandatoryCriteria = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mandatoryCriteria: prev.mandatoryCriteria.filter((_, i) => i !== index),
    }));
  };

  const [softSkillInput, setSoftSkillInput] = useState("");

  const handleAddSoftSkill = () => {
    if (softSkillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        softSkills: [...prev.softSkills, softSkillInput.trim()],
      }));
      setSoftSkillInput("");
    }
  };

  const handleRemoveSoftSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      softSkills: prev.softSkills.filter((_, i) => i !== index),
    }));
  };

  // Edit state for mandatory criteria tags
  const [editingCriteriaIndex, setEditingCriteriaIndex] = useState<
    number | null
  >(null);
  const [editingCriteriaValue, setEditingCriteriaValue] = useState("");

  const handleEditCriteria = (index: number) => {
    setEditingCriteriaIndex(index);
    setEditingCriteriaValue(formData.mandatoryCriteria[index]);
  };

  const handleSaveCriteria = () => {
    if (editingCriteriaValue.trim() && editingCriteriaIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        mandatoryCriteria: prev.mandatoryCriteria.map((c, i) =>
          i === editingCriteriaIndex ? editingCriteriaValue.trim() : c
        ),
      }));
    }
    setEditingCriteriaIndex(null);
    setEditingCriteriaValue("");
  };

  // Edit state for soft skills tags
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );
  const [editingSkillValue, setEditingSkillValue] = useState("");

  const handleEditSkill = (index: number) => {
    setEditingSkillIndex(index);
    setEditingSkillValue(formData.softSkills[index]);
  };

  const handleSaveSkill = () => {
    if (editingSkillValue.trim() && editingSkillIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        softSkills: prev.softSkills.map((s, i) =>
          i === editingSkillIndex ? editingSkillValue.trim() : s
        ),
      }));
    }
    setEditingSkillIndex(null);
    setEditingSkillValue("");
  };

  const handleSyncWithAI = () => {
    console.log("Syncing with AI! 🤖✨");
  };

  // Check if all required fields are filled
  const isFormValid =
    formData.title.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.deadline !== "" &&
    formData.qualifications.length > 0 &&
    formData.mandatoryCriteria.length > 0 &&
    formData.softSkills.length > 0;

  const handleSaveAsDraft = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    const {
      title,
      description,
      qualifications,
      mandatoryCriteria,
      softSkills,
      deadline,
    } = formData;

    // For draft, only title is required
    if (!title.trim()) {
      setError("Job title is required to save as draft");
      setLoading(false);
      return;
    }

    try {
      const result = await createJob(
        title,
        description || "Draft - No description yet",
        qualifications,
        mandatoryCriteria,
        softSkills,
        deadline ? new Date(deadline) : null,
        "DRAFT" // Force status to DRAFT
      );

      if (result.success) {
        setSuccess(true);
        setSuccessMessage("Draft saved successfully! Redirecting...");
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        // Reset form
        setFormData({
          title: "",
          description: "",
          qualifications: [],
          mandatoryCriteria: [],
          softSkills: [],
          status: "DRAFT",
          deadline: "",
        });
        // Redirect to jobs page after short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError(result.message || "Failed to save draft");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const {
      title,
      description,
      qualifications,
      mandatoryCriteria,
      softSkills,
      status,
      deadline,
    } = formData;

    if (
      !title ||
      !description ||
      !qualifications.length ||
      !mandatoryCriteria.length ||
      !softSkills.length ||
      !deadline
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const result = await createJob(
        title,
        description,
        qualifications,
        mandatoryCriteria,
        softSkills,
        deadline ? new Date(deadline) : null,
        status
      );

      if (result.success) {
        setSuccess(true);
        setSuccessMessage("Job posted successfully! Redirecting...");
        // Reset form
        setFormData({
          title: "",
          description: "",
          qualifications: [],
          mandatoryCriteria: [],
          softSkills: [],
          status: "DRAFT",
          deadline: "",
        });
        // Redirect to jobs page after short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError(result.message || "Failed to create job posting");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[1.5rem]">
      {/* Success/Error Messages */}
      {success && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-[0.875rem] text-green-800 font-medium">
            ✓ {successMessage}
          </p>
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-[0.875rem] text-red-800 font-medium">✗ {error}</p>
        </div>
      )}

      {/* job information form */}
      <div className="flex flex-col gap-[1rem]">
        <h3 className="text-[1.125rem] font-semibold">Job Information</h3>
        <div className="w-full flex flex-row gap-[0.5rem]">
          <Input
            label="Job Title"
            name="title"
            type="text"
            placeholder="Enter job title"
            isMandatory
            value={formData.title}
            onChange={handleInputChange}
            className="flex-1"
          />
          <Input
            label="Deadline"
            name="deadline"
            type="date"
            isMandatory
            value={formData.deadline}
            onChange={handleInputChange}
            className="flex-1"
          />
        </div>
        <span className="w-full flex flex-col items-end gap-[0.5rem]">
          <Input
            label="Job Description"
            name="description"
            variant="textarea"
            placeholder="Enter job description"
            className="w-full"
            isMandatory
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
          />
          <Button
            variant="primary"
            type="button"
            onClick={handleGenerateAI}
            className="w-fit"
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate with AI
          </Button>
        </span>
      </div>

      <div className="w-full flex flex-col xl:flex-row gap-[1rem] xl:gap-[1.5rem]">
        {/* job requirements form */}
        <div className="w-full xl:w-1/2 flex flex-col gap-[1rem]">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-[0.5rem]">
              <h3 className="text-[1.125rem] font-semibold">
                Job Requirements
              </h3>
              <p className="text-[0.875rem] text-gray-600">
                Define the core requirements for this position by entering them
                below. Once you've added your criteria, use the "Sync with AI"
                feature to automatically format and categorize them into smart
                tags. This structured data allows our system to precisely filter
                and rank candidates, ensuring you focus on the applicants who
                best match your specific needs.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-[0.5rem]">
            <label className="text-sm font-medium text-gray-700">
              Qualifications <span className="text-red-500">*</span>
            </label>

            {/* Qualifications List */}
            <div className="flex flex-col gap-[0.5rem]">
              {formData.qualifications.map((qual, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[0.5rem] px-4 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {editingQualificationIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={editingQualificationValue}
                        onChange={(e) =>
                          setEditingQualificationValue(e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveQualification(index);
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[0.875rem]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveQualification(index)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-[0.875rem]">{qual}</span>
                      <button
                        type="button"
                        onClick={() => handleEditQualification(index)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Qualification Input */}
            <div className="flex gap-[0.5rem]">
              <input
                type="text"
                placeholder="Ex: Graduate of Bachelor of Science..."
                value={qualificationInput}
                onChange={(e) => setQualificationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQualification();
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleAddQualification}
                rightIcon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            <Button
              variant="primary"
              type="button"
              onClick={handleSyncWithAI}
              className="w-full"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Sync With AI
            </Button>
          </div>
        </div>
        <div className="w-full xl:w-1/2 flex flex-col gap-[1rem]">
          <div className="flex flex-col gap-[0.5rem]">
            <h3 className="text-[1.125rem] font-semibold">
              AI Screening Criteria
            </h3>
            <p className="text-[0.875rem] text-gray-600">
              Help your AI assistant find the right fit! Define the 'must-have'
              qualifications here. The AI will prioritize candidates who check
              every one of these boxes, ensuring you only spend time on
              applicants who meet your baseline requirements.
            </p>
          </div>
          <TableContainer>
            <TableHeader className="flex flex-col gap-[0.125rem]">
              <h4 className="text-sm font-medium text-gray-700">
                Mandatory Criteria <span className="text-red-500">*</span>
              </h4>
            </TableHeader>
            <TableBody>
              <div className="flex flex-col gap-[1rem]">
                {/* Tags Display */}
                <div className="flex flex-wrap gap-[0.5rem]">
                  {formData.mandatoryCriteria.map((criteria, index) =>
                    editingCriteriaIndex === index ? (
                      <div
                        key={index}
                        className="inline-flex items-center gap-[0.5rem]"
                      >
                        <input
                          type="text"
                          value={editingCriteriaValue}
                          onChange={(e) =>
                            setEditingCriteriaValue(e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveCriteria();
                            }
                          }}
                          onBlur={handleSaveCriteria}
                          className="border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Tag
                        key={index}
                        onClick={() => handleEditCriteria(index)}
                        onRemove={() => handleRemoveMandatoryCriteria(index)}
                      >
                        {criteria}
                      </Tag>
                    )
                  )}
                </div>

                {/* Add Input */}
                <div className="flex gap-[0.5rem]">
                  <input
                    type="text"
                    placeholder="Ex: [Education] B.S. Medical Technology, [License] Registered Medical Technologist (RMT)..."
                    value={mandatoryCriteriaInput}
                    onChange={(e) => setMandatoryCriteriaInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMandatoryCriteria();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleAddMandatoryCriteria}
                    rightIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </TableBody>
          </TableContainer>
          <TableContainer>
            <TableHeader className="flex flex-col gap-[0.125rem]">
              <h4 className="text-sm font-medium text-gray-700">
                Soft Skill Tags (For more AI Analysis){" "}
                <span className="text-red-500">*</span>
              </h4>
            </TableHeader>
            <TableBody>
              <div className="flex flex-col gap-[1rem]">
                {/* Tags Display */}
                <div className="flex flex-wrap gap-[0.5rem]">
                  {formData.softSkills.map((skill, index) =>
                    editingSkillIndex === index ? (
                      <div
                        key={index}
                        className="inline-flex items-center gap-[0.5rem]"
                      >
                        <input
                          type="text"
                          value={editingSkillValue}
                          onChange={(e) => setEditingSkillValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveSkill();
                            }
                          }}
                          onBlur={handleSaveSkill}
                          className="px-3 py-1.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <Tag
                        key={index}
                        onClick={() => handleEditSkill(index)}
                        onRemove={() => handleRemoveSoftSkill(index)}
                      >
                        {skill}
                      </Tag>
                    )
                  )}
                </div>

                {/* Add Input */}
                <div className="flex gap-[0.5rem]">
                  <input
                    type="text"
                    placeholder="Ex: [Skill] Computer Literate, [Trait] Attention to Detail..."
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSoftSkill();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleAddSoftSkill}
                    rightIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </TableBody>
          </TableContainer>
        </div>
      </div>
      <Separator />
      <div className="flex flex-row gap-[1.5rem] justify-between items-center">
        <div className="flex flex-row gap-[1.5rem] items-start">
          <Switch
            checked={formData.status === "ACTIVE"}
            onChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                status: checked ? "ACTIVE" : "DRAFT",
              }))
            }
          />
          <div className="flex flex-col gap-0">
            <p className="text-[1rem] font-semibold">Set Status to "Open"</p>
            <p className="text-[0.875rem] text-gray-600">
              The job will be visible on the public job board and the AI will
              start screening resumes immediately
            </p>
          </div>
        </div>
        <div className="flex gap-[0.5rem]">
          <Button
            variant="outlined"
            type="button"
            onClick={handleSaveAsDraft}
            disabled={!formData.title.trim() || loading}
          >
            Save as Draft
          </Button>
          <Button
            variant="accent"
            type="submit"
            disabled={!isFormValid || loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}

type JobDetailsEditorProps = {
  slug: string;
};

export function JobDetailsEditor({ slug }: JobDetailsEditorProps) {
  const [job, setJob] = useState<any>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [mandatoryCriteria, setMandatoryCriteria] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<string>("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "CLOSED">("DRAFT");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Confirmation modal for closing job
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [closeConfirmationSlug, setCloseConfirmationSlug] = useState("");
  const [pendingStatus, setPendingStatus] = useState<
    "DRAFT" | "ACTIVE" | "CLOSED" | null
  >(null);

  // Confirmation modal for deleting job
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationSlug, setDeleteConfirmationSlug] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      if (!slug) return;
      try {
        const result = await getJobBySlug(slug);
        if (result.success && result.job) {
          setJob(result.job);
          setTitle(result.job.title || "");
          setDescription(result.job.description || "");
          setQualifications(result.job.qualifications || []);
          setMandatoryCriteria(result.job.mandatoryCriteria || []);
          setSoftSkills(result.job.softSkills || []);
          // Filter out ARCHIVED status, default to DRAFT
          const jobStatus =
            result.job.status === "ARCHIVED"
              ? "DRAFT"
              : result.job.status || "DRAFT";
          setStatus(jobStatus as "DRAFT" | "ACTIVE" | "CLOSED");
          setDeadline(
            result.job.deadline
              ? new Date(result.job.deadline).toISOString().split("T")[0]
              : ""
          );
        } else {
          setError(result.message || "Failed to load job");
        }
      } catch (err) {
        setError("An error occurred while loading");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  // Track changes
  useEffect(() => {
    if (!job) return;
    const originalDeadline = job.deadline
      ? new Date(job.deadline).toISOString().split("T")[0]
      : "";

    const changed =
      title !== (job.title || "") ||
      description !== (job.description || "") ||
      JSON.stringify(qualifications) !== JSON.stringify(job.qualifications) ||
      JSON.stringify(mandatoryCriteria) !==
        JSON.stringify(job.mandatoryCriteria) ||
      JSON.stringify(softSkills) !== JSON.stringify(job.softSkills) ||
      deadline !== originalDeadline ||
      status !== (job.status || "DRAFT");

    setHasChanges(changed);
  }, [
    title,
    description,
    qualifications,
    mandatoryCriteria,
    softSkills,
    deadline,
    status,
    job,
  ]);

  // Save all changes
  const handleSave = async () => {
    if (!job || !hasChanges) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await updateJob(job.id, {
        title,
        description,
        qualifications,
        mandatoryCriteria,
        softSkills,
        deadline: deadline ? new Date(deadline) : null,
        status,
      });

      if (result.success) {
        setSuccessMessage("Changes saved successfully!");
        setJob(result.job);
        setHasChanges(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.message || "Failed to save changes");
      }
    } catch (err) {
      setError("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel changes with confirmation
  const handleCancel = () => {
    if (!hasChanges) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel? All unsaved changes will be lost."
    );

    if (confirmed && job) {
      // Revert to original values
      setTitle(job.title || "");
      setDescription(job.description || "");
      setQualifications(job.qualifications || []);
      setMandatoryCriteria(job.mandatoryCriteria || []);
      setSoftSkills(job.softSkills || []);
      setStatus(job.status || "DRAFT");
      setDeadline(
        job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : ""
      );
      setError("");
      setSuccessMessage("");
    }
  };

  // Handle status change with confirmation for CLOSED and DRAFT
  const handleStatusChange = (newStatus: "DRAFT" | "ACTIVE" | "CLOSED") => {
    // Show confirmation for DRAFT or CLOSED (but not when already in that status)
    if (
      (newStatus === "CLOSED" && status !== "CLOSED") ||
      (newStatus === "DRAFT" && status !== "DRAFT")
    ) {
      setPendingStatus(newStatus);
      setShowCloseConfirmation(true);
      setCloseConfirmationSlug("");
    } else {
      // Direct change for OPEN or same status
      setStatus(newStatus);
    }
  };

  // Confirm status change
  const handleConfirmClose = () => {
    if (!job || !pendingStatus) return;

    if (closeConfirmationSlug === job.slug) {
      setStatus(pendingStatus);
      setShowCloseConfirmation(false);
      setCloseConfirmationSlug("");
      setPendingStatus(null);
    } else {
      setError("Incorrect job slug. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Cancel status change
  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
    setCloseConfirmationSlug("");
    setPendingStatus(null);
  };

  // Handle delete job
  const handleDeleteJob = () => {
    setShowDeleteConfirmation(true);
    setDeleteConfirmationSlug("");
  };

  // Confirm delete job
  const handleConfirmDelete = async () => {
    if (!job) return;

    if (deleteConfirmationSlug === job.slug) {
      setIsDeleting(true);
      try {
        const result = await deleteJob(job.id);
        if (result.success) {
          // Redirect to recruitment page after successful deletion
          window.location.href = "/recruitment";
        } else {
          setError(result.message || "Failed to delete job");
          setIsDeleting(false);
          setShowDeleteConfirmation(false);
          setDeleteConfirmationSlug("");
        }
      } catch (err) {
        setError("Failed to delete job");
        setIsDeleting(false);
        setShowDeleteConfirmation(false);
        setDeleteConfirmationSlug("");
      }
    } else {
      setError("Incorrect job slug. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Cancel delete job
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationSlug("");
  };

  // Add/Remove/Edit handlers for qualifications
  const [addingQual, setAddingQual] = useState(false);
  const [qualInput, setQualInput] = useState("");
  const [editingQualIndex, setEditingQualIndex] = useState<number | null>(null);
  const [editingQualValue, setEditingQualValue] = useState("");

  const handleAddQualification = () => {
    if (qualInput.trim()) {
      setQualifications([...qualifications, qualInput.trim()]);
      setQualInput("");
      setAddingQual(false);
    }
  };

  const handleEditQualification = (index: number) => {
    setEditingQualIndex(index);
    setEditingQualValue(qualifications[index]);
  };

  const handleSaveQualification = () => {
    if (editingQualValue.trim() && editingQualIndex !== null) {
      const newQuals = [...qualifications];
      newQuals[editingQualIndex] = editingQualValue.trim();
      setQualifications(newQuals);
      setEditingQualIndex(null);
      setEditingQualValue("");
    }
  };

  const handleRemoveQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  // Add/Remove/Edit handlers for mandatory criteria
  const [addingCriteria, setAddingCriteria] = useState(false);
  const [criteriaInput, setCriteriaInput] = useState("");
  const [editingCriteriaIndex, setEditingCriteriaIndex] = useState<
    number | null
  >(null);
  const [editingCriteriaValue, setEditingCriteriaValue] = useState("");

  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      setMandatoryCriteria([...mandatoryCriteria, criteriaInput.trim()]);
      setCriteriaInput("");
      setAddingCriteria(false);
    }
  };

  const handleEditCriteria = (index: number) => {
    setEditingCriteriaIndex(index);
    setEditingCriteriaValue(mandatoryCriteria[index]);
  };

  const handleSaveCriteria = () => {
    if (editingCriteriaValue.trim() && editingCriteriaIndex !== null) {
      const newCriteria = [...mandatoryCriteria];
      newCriteria[editingCriteriaIndex] = editingCriteriaValue.trim();
      setMandatoryCriteria(newCriteria);
      setEditingCriteriaIndex(null);
      setEditingCriteriaValue("");
    }
  };

  const handleRemoveCriteria = (index: number) => {
    setMandatoryCriteria(mandatoryCriteria.filter((_, i) => i !== index));
  };

  // Add/Remove/Edit handlers for soft skills
  const [addingSkill, setAddingSkill] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );
  const [editingSkillValue, setEditingSkillValue] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSoftSkills([...softSkills, skillInput.trim()]);
      setSkillInput("");
      setAddingSkill(false);
    }
  };

  const handleEditSkill = (index: number) => {
    setEditingSkillIndex(index);
    setEditingSkillValue(softSkills[index]);
  };

  const handleSaveSkill = () => {
    if (editingSkillValue.trim() && editingSkillIndex !== null) {
      const newSkills = [...softSkills];
      newSkills[editingSkillIndex] = editingSkillValue.trim();
      setSoftSkills(newSkills);
      setEditingSkillIndex(null);
      setEditingSkillValue("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSoftSkills(softSkills.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            ✓ {successMessage}
          </p>
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800 font-medium">✗ {error}</p>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-[1rem] xl:gap-[1.5rem]">
        {/* Qualifications Section */}
        <div className="w-full xl:w-1/2 flex flex-col gap-[1rem]">
          <h3 className="text-[1.125rem] font-semibold">Qualifications</h3>
          <Button rightIcon={<Sparkles className="w-4 h-4" />}>
            Sync With AI
          </Button>
          <TableContainer>
            <TableHeader className="flex flex-row justify-between items-center">
              <h2 className="text-[1rem] font-semibold">Qualifications</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setAddingQual(true)}
                rightIcon={<Plus className="w-4 h-4" />}
              />
            </TableHeader>
            {qualifications.map((qual, index) => (
              <TableBody key={index} className="border-b border-slate-200">
                {editingQualIndex === index ? (
                  <div className="flex flex-row justify-between gap-[0.5rem] items-center">
                    <Input
                      type="text"
                      value={editingQualValue}
                      onChange={(e) => setEditingQualValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveQualification();
                        } else if (e.key === "Escape") {
                          setEditingQualIndex(null);
                          setEditingQualValue("");
                        }
                      }}
                      autoFocus
                      size="sm"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      iconOnly
                      onClick={handleSaveQualification}
                      rightIcon={<Check className="w-4 h-4" />}
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      iconOnly
                      onClick={() => {
                        setEditingQualIndex(null);
                        setEditingQualValue("");
                      }}
                      rightIcon={<X className="w-4 h-4" />}
                    />
                  </div>
                ) : (
                  <div className="flex flex-row gap-[0.5rem]">
                    <span className="flex-1 text-sm">{qual}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => handleEditQualification(index)}
                      rightIcon={<Pencil className="w-4 h-4" />}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => handleRemoveQualification(index)}
                      rightIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                    />
                  </div>
                )}
              </TableBody>
            ))}
            {addingQual && (
              <TableBody className="flex flex-col gap-[0.5rem] border-t border-slate-200">
                <Input
                  type="text"
                  placeholder="Enter qualification..."
                  value={qualInput}
                  onChange={(e) => setQualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddQualification();
                    }
                  }}
                  size="sm"
                  className="flex-1"
                />
                <div className="flex flex-row justify-end gap-[0.5rem]">
                  <Button
                    type="button"
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      setAddingQual(false);
                      setQualInput("");
                    }}
                    rightIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddQualification}
                    rightIcon={<PlusIcon className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </TableBody>
            )}
            {qualifications.length === 0 && !addingQual && (
              <p className="text-sm text-gray-400 italic text-center py-4">
                No qualifications added yet
              </p>
            )}
          </TableContainer>
        </div>
        <div className="w-full xl:w-1/2 flex flex-col gap-[1rem]">
          <h3 className="text-[1.125rem] font-semibold">
            AI Screening Criteria
          </h3>
          {/* Mandatory Criteria Section */}
          <TableContainer>
            <TableHeader className="flex flex-row justify-between items-center">
              <h2 className="text-[1.125rem] font-semibold">
                Mandatory Criteria
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setAddingCriteria(true)}
                rightIcon={<Plus className="w-4 h-4" />}
              />
            </TableHeader>
            <TableBody className="flex flex-wrap gap-[0.5rem]">
              {mandatoryCriteria.map((criteria, index) =>
                editingCriteriaIndex === index ? (
                  <div
                    key={index}
                    className="inline-flex items-center gap-[0.5rem]"
                  >
                    <Input
                      type="text"
                      value={editingCriteriaValue}
                      onChange={(e) => setEditingCriteriaValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveCriteria();
                        } else if (e.key === "Escape") {
                          setEditingCriteriaIndex(null);
                          setEditingCriteriaValue("");
                        }
                      }}
                      autoFocus
                      size="sm"
                      className="rounded-full text-sm"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      iconOnly
                      onClick={handleSaveCriteria}
                      rightIcon={<Check className="w-4 h-4" />}
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      iconOnly
                      onClick={() => {
                        setEditingCriteriaIndex(null);
                        setEditingCriteriaValue("");
                      }}
                      rightIcon={<X className="w-4 h-4" />}
                    />
                  </div>
                ) : (
                  <Tag
                    key={index}
                    onClick={() => handleEditCriteria(index)}
                    onRemove={() => handleRemoveCriteria(index)}
                  >
                    {criteria}
                  </Tag>
                )
              )}
              {mandatoryCriteria.length === 0 && !addingCriteria && (
                <p className="text-sm text-gray-400 italic w-full text-center py-4">
                  No mandatory criteria added yet
                </p>
              )}
            </TableBody>
            {addingCriteria && (
              <TableBody className="flex flex-col gap-[0.5rem] border-t border-slate-200">
                <Input
                  type="text"
                  placeholder="Enter criteria..."
                  value={criteriaInput}
                  onChange={(e) => setCriteriaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCriteria();
                    }
                  }}
                  size="sm"
                  className="flex-1"
                />
                <div className="flex flex-row justify-end gap-[0.5rem]">
                  <Button
                    type="button"
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      setAddingCriteria(false);
                      setCriteriaInput("");
                    }}
                    rightIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddCriteria}
                    rightIcon={<PlusIcon className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </TableBody>
            )}
          </TableContainer>
          {/* Soft Skills Section */}
          <TableContainer>
            <TableHeader className="flex flex-row justify-between items-center">
              <h2 className="text-[1.125rem] font-semibold">Soft Skills</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setAddingSkill(true)}
                rightIcon={<Plus className="w-4 h-4" />}
              />
            </TableHeader>
            <TableBody className="flex flex-wrap gap-2">
              {softSkills.map((skill, index) =>
                editingSkillIndex === index ? (
                  <div
                    key={index}
                    className="inline-flex items-center gap-[0.5rem]"
                  >
                    <Input
                      type="text"
                      value={editingSkillValue}
                      onChange={(e) => setEditingSkillValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveSkill();
                        } else if (e.key === "Escape") {
                          setEditingSkillIndex(null);
                          setEditingSkillValue("");
                        }
                      }}
                      autoFocus
                      size="sm"
                      className="rounded-full text-sm"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      iconOnly
                      onClick={handleSaveSkill}
                      rightIcon={<Check className="w-4 h-4" />}
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      iconOnly
                      onClick={() => {
                        setEditingSkillIndex(null);
                        setEditingSkillValue("");
                      }}
                      rightIcon={<X className="w-4 h-4" />}
                    />
                  </div>
                ) : (
                  <Tag
                    key={index}
                    onClick={() => handleEditSkill(index)}
                    onRemove={() => handleRemoveSkill(index)}
                  >
                    {skill}
                  </Tag>
                )
              )}
              {softSkills.length === 0 && !addingSkill && (
                <p className="text-sm text-gray-400 italic w-full text-center py-4">
                  No soft skills added yet
                </p>
              )}
            </TableBody>
            {addingSkill && (
              <TableBody className="flex flex-col gap-[0.5rem] border-t border-slate-200">
                <Input
                  type="text"
                  placeholder="Enter soft skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  size="sm"
                  className="flex-1"
                />
                <div className="flex flex-row justify-end gap-[0.5rem]">
                  <Button
                    type="button"
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      setAddingSkill(false);
                      setSkillInput("");
                    }}
                    rightIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddSkill}
                    rightIcon={<Check className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </TableBody>
            )}
          </TableContainer>
        </div>
      </div>

      {/* Job Details Section */}
      <div className="flex flex-col gap-[1rem]">
        <h2 className="text-[1.125rem] font-semibold">Job Details</h2>

        <div className="flex flex-row gap-[0.5rem]">
          {/* Job Title */}
          <Input
            label="Job Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter job title..."
            className="w-full"
          />
          {/* Application Deadline */}
          <Input
            type="date"
            label="Application Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Job Description */}
        <Input
          label="Description"
          variant="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter job description..."
          rows={6}
        />
      </div>

      <Separator />

      {/* Save/Cancel Buttons */}
      <div className="flex justify-between items-center">
        {/* Left side: Delete button */}
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteJob}
          disabled={isSaving || isDeleting}
          rightIcon={<Trash2 className="w-4 h-4" />}
        >
          Delete Job
        </Button>

        {/* Right side: Status and action buttons */}
        <div className="flex items-center gap-4">
          {/* Status Switcher */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <StatusDropdown
              value={status}
              onChange={handleStatusChange}
              disabled={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
              rightIcon={!isSaving && <Check className="w-5 h-5" />}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCloseConfirmation}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title={
          pendingStatus === "DRAFT" ? "Set to Draft?" : "Close Job Posting?"
        }
        description={
          pendingStatus === "DRAFT"
            ? "This will remove the job from the public hiring page and stop accepting new applications. The job will be saved as a draft."
            : "This will remove the job from the public hiring page and stop accepting new applications. This action can be reversed by changing the status back to Open."
        }
        confirmText={pendingStatus === "DRAFT" ? "Set to Draft" : "Close Job"}
        variant="warning"
        requireSlugConfirmation
        slug={job?.slug}
        slugValue={closeConfirmationSlug}
        onSlugChange={setCloseConfirmationSlug}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Job Permanently?"
        description="This action cannot be undone. This will permanently delete the job posting, all associated applications, and remove it from all systems."
        confirmText="Delete Permanently"
        variant="destructive"
        requireSlugConfirmation
        slug={job?.slug}
        slugValue={deleteConfirmationSlug}
        onSlugChange={setDeleteConfirmationSlug}
        isLoading={isDeleting}
      />
    </div>
  );
}
