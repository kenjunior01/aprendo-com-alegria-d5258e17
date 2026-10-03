import logoSrc from "@/assets/kidoz-logo.webp";

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
      width={672}
      height={448}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
