type TitleProps = {
  title: string;
  subtitle?: string;
  textAlign?: "left" | "center" | "right";
  className?: string;
};

export function Title({
  title,
  subtitle,
  textAlign = "center",
  className = "",
}: TitleProps) {
  return (
    <div className={`flex flex-col py-[1rem] text-${textAlign} ${className}`}>
      <h1 className="text-[1.185rem] md:text-[1.5rem] font-semibold">
        {title}
      </h1>
      <p className="text-[0.875rem] md:text-[1rem] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}
