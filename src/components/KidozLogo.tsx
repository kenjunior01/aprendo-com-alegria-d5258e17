import logoSrc from "@/assets/kidoz-logo.png";

type Props = {
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function KidozLogo({ className, alt = "Kidoz", priority = false }: Props) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      width={1536}
      height={1024}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
