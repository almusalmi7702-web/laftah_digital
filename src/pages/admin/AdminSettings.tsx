const AdminSettings = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">الإعدادات</h1>
        <p className="text-gray-500 mt-1">إعدادات الموقع</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-navy-800 mb-2">قريبًا</h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          سيتم إضافة إعدادات الموقع هنا مستقبلاً، مثل:
        </p>
        <ul className="text-gray-500 text-sm text-right max-w-xs mx-auto space-y-2">
          <li>• رقم الواتساب</li>
          <li>• روابط التواصل الاجتماعي</li>
          <li>• البريد الإلكتروني</li>
          <li>• نصوص الصفحة الرئيسية</li>
          <li>• إعدادات SEO</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
