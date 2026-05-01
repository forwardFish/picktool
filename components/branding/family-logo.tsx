import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FamilyLogoProps = {
  href?: string;
  className?: string;
  textClassName?: string;
  subtitleClassName?: string;
  markClassName?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
};

const sizeMap = {
  sm: {
    mark: 38,
    title: "text-xl",
    subtitle: "text-sm",
    gap: "gap-3",
  },
  md: {
    mark: 44,
    title: "text-2xl",
    subtitle: "text-base",
    gap: "gap-3",
  },
  lg: {
    mark: 56,
    title: "text-[2.05rem]",
    subtitle: "text-lg",
    gap: "gap-4",
  },
} as const;

function LogoInner({
  className,
  textClassName,
  subtitleClassName,
  markClassName,
  size = "md",
  showSubtitle = true,
}: Omit<FamilyLogoProps, "href">) {
  const current = sizeMap[size];

  return (
    <span className={cn("inline-flex items-center", current.gap, className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-[0.9rem] bg-transparent",
          markClassName
        )}
        style={{ width: current.mark, height: current.mark }}
      >
        <Image
          src="/logo.png"
          alt="Pathnook logo mark"
          width={current.mark}
          height={current.mark}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            current.title,
            "font-bold tracking-[-0.03em] text-slate-950",
            textClassName
          )}
        >
          Pathnook
        </span>
        {showSubtitle ? (
          <span
            className={cn(
              current.subtitle,
              "text-slate-500",
              subtitleClassName
            )}
          >
            Family learning support
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function FamilyLogo(props: FamilyLogoProps) {
  const { href = "/", ...rest } = props;

  return (
    <Link href={href} className="inline-flex">
      <LogoInner {...rest} />
    </Link>
  );
}

export function FamilyLogoStatic(props: Omit<FamilyLogoProps, "href">) {
  return <LogoInner {...props} />;
}
