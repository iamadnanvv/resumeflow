import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-gradient-primary rounded-lg p-1.5 shadow-elegant">
          <FileText className={size === "sm" ? "h-4 w-4 text-primary-foreground" : "h-5 w-5 text-primary-foreground"} strokeWidth={2.5} />
        </div>
      </div>
      <span className={`font-display font-semibold tracking-tight ${size === "sm" ? "text-base" : "text-xl"}`}>
        Resume<span className="text-primary">ly</span>
      </span>
    </Link>
  );
}