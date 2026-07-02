import { Sparkles } from 'lucide-react';

interface PlaceholderProps {
  label?: string;
  className?: string;
  iconSize?: string;
}

const ImagePlaceholder = ({ label = 'لافتة ديجيتال', className = '', iconSize = 'w-10 h-10' }: PlaceholderProps) => (
  <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-gray-50 to-teal-50/50 ${className}`}>
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 flex items-center justify-center mb-2">
      <Sparkles className={`${iconSize} text-teal-500/60`} />
    </div>
    <span className="text-xs font-bold text-teal-600/50">{label}</span>
  </div>
);

export default ImagePlaceholder;
