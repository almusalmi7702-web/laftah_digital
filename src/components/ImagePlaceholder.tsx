interface PlaceholderProps {
  label?: string;
  className?: string;
  imageClassName?: string;
  iconSize?: string;
  variant?: 'icon' | 'full';
}

const ImagePlaceholder = ({
  label,
  className = '',
  imageClassName = '',
  variant = 'icon',
}: PlaceholderProps) => {
  const src = variant === 'full' ? '/Logo.png' : '/Iconlogo.png';
  const alt = variant === 'full' ? 'Laftah Digital' : 'Laftah Digital Icon';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-gray-50 to-teal-50/50 ${className}`}>
      <div
        className={
          variant === 'full'
            ? 'w-full h-full flex items-center justify-center p-8'
            : 'w-20 h-20 rounded-2xl bg-white/80 border border-teal-100 shadow-sm flex items-center justify-center p-4'
        }
      >
        <img
          src={src}
          alt={alt}
          className={
            variant === 'full'
              ? `max-w-[260px] max-h-[150px] object-contain ${imageClassName}`
              : `w-full h-full object-contain ${imageClassName}`
          }
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {label && (
        <span className="text-xs font-bold text-teal-600/50 mt-2">{label}</span>
      )}
    </div>
  );
};

export default ImagePlaceholder;
