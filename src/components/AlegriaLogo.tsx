import logoSrc from "@/assets/alegria-logo.png";

type Props = {
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function AlegriaLogo({ className, alt = "Alegria", priority = false }: Props) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      width={1536}
      height={1024}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
