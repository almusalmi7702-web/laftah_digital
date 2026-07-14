import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Layers, Tag, HelpCircle, Plus, ArrowLeft } from 'lucide-react';
import { getDashboardStats } from '../../services/dataService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    portfolioCount: 0,
    servicesCount: 0,
    pricingCount: 0,
    faqsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'الأعمال المنشورة',
      count: stats.portfolioCount,
      icon: Briefcase,
      color: 'from-teal-400 to-teal-600',
      link: '/admin/portfolio',
    },
    {
      label: 'الخدمات',
      count: stats.servicesCount,
      icon: Layers,
      color: 'from-navy-600 to-navy-800',
      link: '/admin/services',
    },
    {
      label: 'باقات الأسعار',
      count: stats.pricingCount,
      icon: Tag,
      color: 'from-teal-500 to-teal-700',
      link: '/admin/pricing',
    },
    {
      label: 'الأسئلة الشائعة',
      count: stats.faqsCount,
      icon: HelpCircle,
      color: 'from-navy-500 to-navy-700',
      link: '/admin/faqs',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-theme-text">لوحة التحكم</h1>
        <p className="text-theme-text-secondary mt-1">مرحباً بك في لوحة التحكم</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="bg-theme-surface rounded-xl p-6 shadow-theme-card border border-theme-border hover:shadow-theme-elevated transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-theme-text-secondary text-sm mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-theme-text">{card.count}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-theme-surface rounded-xl p-6 shadow-theme-card border border-theme-border">
        <h2 className="text-lg font-bold text-theme-text mb-4">إضافة سريعة</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/portfolio/new"
            className="flex items-center gap-2 px-4 py-3 bg-theme-primary-soft text-theme-primary rounded-lg hover:bg-theme-primary-soft transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            عمل جديد
          </Link>
          <Link
            to="/admin/services/new"
            className="flex items-center gap-2 px-4 py-3 bg-theme-muted text-theme-text rounded-lg hover:bg-theme-elevated transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            خدمة جديدة
          </Link>
          <Link
            to="/admin/pricing"
            className="flex items-center gap-2 px-4 py-3 bg-theme-primary-soft text-theme-primary rounded-lg hover:bg-theme-primary-soft transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            باقة جديدة
          </Link>
          <Link
            to="/admin/faqs"
            className="flex items-center gap-2 px-4 py-3 bg-theme-muted text-theme-text rounded-lg hover:bg-theme-elevated transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            سؤال جديد
          </Link>
        </div>
      </div>

      {/* View site */}
      <div className="mt-6 text-center">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-theme-primary hover:text-theme-primary-hover font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          عرض الموقع
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
