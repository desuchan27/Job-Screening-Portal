"use client";

type TableContainerProps = {
  children: React.ReactNode;
  className?: string;
};

type TableHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type TableBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export const TableContainer = ({
  children,
  className = "",
}: TableContainerProps) => {
  return (
    <div
      className={`border border-slate-200 rounded-[0.5rem] overflow-visible bg-white ${className}`}
    >
      {children}
    </div>
  );
};

export const TableHeader = ({ children, className = "" }: TableHeaderProps) => {
  return (
    <div
      className={`px-[1.5rem] py-[0.875rem] border-b border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const TableBody = ({ children, className = "" }: TableBodyProps) => {
  return (
    <div className={`px-[1.5rem] py-[0.875rem] ${className}`}>{children}</div>
  );
};
