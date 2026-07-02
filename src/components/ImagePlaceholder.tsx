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
}: PlaceholderProps) => {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-gray-50 to-teal-50/50 ${className}`}>
      <div className="w-full h-full flex items-center justify-center p-8">
        <img
          src="/Logo.png"
          alt="Laftah Digital"
          className={`max-w-[260px] max-h-[150px] object-contain ${imageClassName}`}
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
