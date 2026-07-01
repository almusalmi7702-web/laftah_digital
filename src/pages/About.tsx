import { ReactNode } from 'react';
import { Eye, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { about } from '../data/content';

const About = () => {
  const { ref, isInView } = useInView(0.05);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-bl from-gray-50 via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right" ref={ref}>
          <span className="inline-block bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            {about.title}
          </span>
          <h1 className={`text-4xl md:text-5xl font-black text-navy-800 mb-8 leading-tight transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {about.meaningTitle}
          </h1>
          <p className={`text-gray-600 text-lg leading-[1.9] transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {about.meaningText}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <StoryCard
            icon={<Sparkles className="w-8 h-8 text-white" />}
            title={about.storyTitle}
            text={about.storyText}
            color="from-teal-500 to-teal-600"
          />
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <StoryCard
              icon={<Eye className="w-8 h-8 text-white" />}
              title={about.visionTitle}
              text={about.visionText}
              color="from-teal-500 to-teal-600"
            />
            <StoryCard
              icon={<Target className="w-8 h-8 text-white" />}
              title={about.missionTitle}
              text={about.missionText}
              color="from-teal-500 to-teal-600"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-navy-800 mb-4">هل أنت مستعد؟</h2>
          <p className="text-gray-600 mb-8">نسعد بمساعدتك على بناء حضور بصري يعكس جودة مشروعك.</p>
          <Link
            to="/free-audit"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-500 to-teal-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            احصل على تحليل مجاني
          </Link>
        </div>
      </section>
    </div>
  );
};

interface StoryCardProps {
  icon: ReactNode;
  title: string;
  text: string;
  color: string;
}

const StoryCard = ({ icon, title, text, color }: StoryCardProps) => {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 text-right ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-8`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-navy-800 mb-5">{title}</h3>
      <p className="text-gray-600 leading-[1.9]">{text}</p>
    </div>
  );
};

export default About;
