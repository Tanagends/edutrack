const StatCard = ({ label, value, icon, sub, color = 'orange' }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    blue:   'bg-blue-50 text-blue-500',
    green:  'bg-green-50 text-green-500',
    red:    'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-500',
  };

  return (
    <div className="card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
