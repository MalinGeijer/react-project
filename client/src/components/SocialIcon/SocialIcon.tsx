type SocialIconProps = {
  name: 'instagram' | 'facebook'
  size?: number
  className?: string
}

export function SocialIcon({
  name,
  size = 24,
  className = ''
}: SocialIconProps) {
  return (
    <img
      src={`https://cdn.simpleicons.org/${name}`}
      alt={name}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      loading="lazy"
    />
  )
}
