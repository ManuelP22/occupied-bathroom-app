import React from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'destructive';

interface BaseButtonProps {
  /** Variante de estilo: solid (por defecto), outline o ghost */
  variant?: ButtonVariant;
  /** Contenido del botón */
  children: React.ReactNode;
  /** Clases adicionales para personalizar estilos */
  className?: string;
}

// Props para cuando se renderiza como <a>
type AnchorButtonProps = BaseButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

// Props para cuando se renderiza como <button>
type RegularButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

// Unión discriminada de props
export type ButtonProps = AnchorButtonProps | RegularButtonProps;

const variantConfig: Record<
  ButtonVariant,
  { base: string; outerSpan: string; innerSpan: string }
> = {
  solid: {
    base: 'rounded-md group relative inline-block text-sm font-medium text-white focus:ring-3 focus:outline-hidden',
    outerSpan: 'absolute inset-0 border border-cyan-400',
    innerSpan:
      'block border border-cyan-400 bg-cyan-400 px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1',
  },
  destructive: {
    base: 'rounded-md group relative inline-block text-sm font-medium text-white focus:ring-3 focus:outline-hidden',
    outerSpan: 'absolute inset-0 border border-red-400',
    innerSpan:
      'block border border-red-400 bg-red-400 px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1',
  },
  outline: {
    // Se agregó rounded-md para que tenga bordes redondeados
    base: 'rounded-md group relative inline-block text-sm font-medium text-cyan-400 focus:ring-3 focus:outline-hidden',
    outerSpan: 'absolute inset-0 border border-cyan-400',
    innerSpan:
      'block border border-cyan-400 bg-transparent px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1',
  },
  ghost: {
    // Se agregó rounded-md para que tenga bordes redondeados
    base: 'rounded-md group relative inline-block text-sm font-medium text-cyan-400 focus:ring-3 focus:outline-hidden',
    outerSpan: '', // No se muestra el borde extra en ghost
    innerSpan:
      'block bg-transparent px-12 py-3 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1',
  },
};

const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'solid', children, className = '', ...rest } = props;
  const config = variantConfig[variant];
  const combinedBaseClasses = `${config.base} ${className} cursor-pointer select-none`.trim();

  // Contenido interno del botón con efecto
  const innerContent = (
    <div>
      {config.outerSpan && <span className={config.outerSpan}></span>}
      <span className={config.innerSpan}>{children}</span>
    </div>
  );

  if ('href' in props && props.href) {
    return (
      <a
        href={props.href}
        className={combinedBaseClasses}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      className={combinedBaseClasses}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {innerContent}
    </button>
  );
};

export default Button;