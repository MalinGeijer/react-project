type ButtonProps = {
  label: string;
  action?: () => void;
  link?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const Button = ({
  label,
  action,
  link,
  type = 'button',
  className,
}: ButtonProps) => {
  // Om knapp ska vara en länk <a>
  if (link) {
    return (
      <a href={link} className={className}>
        {label}
      </a>
    );
  }

  // Annars vanlig knapp <button>
  return (
    <button type={type} onClick={action} className={className}>
      {label}
    </button>
  );
};

export default Button;
