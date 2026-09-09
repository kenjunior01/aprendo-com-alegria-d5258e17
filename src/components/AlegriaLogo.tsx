import logoSrc from "@/assets/kidoz-logo.png";

type Props = {
  className?: string;
  alt?: string;
  priority?: boolean;
};

/**
 * Logótipo oficial da plataforma. O produto chama-se Kidoz (kidoz.online).
 * Mantemos o nome do componente `AlegriaLogo` por compatibilidade com os
 * pontos de utilização existentes — "aprender com alegria" é o lema.
 */
export function AlegriaLogo({
  className,
  alt = "Kidoz — aprender com alegria",
  priority = false,
}: Props) {
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
