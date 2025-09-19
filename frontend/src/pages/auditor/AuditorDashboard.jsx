import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

export default function AuditorDashboard() {
  const [values, setValues] = useState([0, 0, 0, 0]);
  const [time, setTime] = useState(new Date());

  const stats = useMemo(
    () => [
      { name: "Total Audits", value: 48, change: "+18.2%", trend: "up", icon: <DocumentCheckIcon className="w-6 h-6 text-blue-600" />, gradient: "from-blue-500 to-blue-600", bg: "from-blue-50 to-blue-100" },
      { name: "Notifications Sent", value: 34, change: "+12.3%", trend: "up", icon: <BellIcon className="w-6 h-6 text-emerald-600" />, gradient: "from-emerald-500 to-emerald-600", bg: "from-emerald-50 to-emerald-100" },
      { name: "Pending Audits", value: 5, change: "-8.1%", trend: "down", icon: <ClipboardDocumentCheckIcon className="w-6 h-6 text-amber-600" />, gradient: "from-amber-500 to-amber-600", bg: "from-amber-50 to-amber-100" },
      { name: "Total Salesman", value: 27, change: "+5.4%", trend: "up", icon: <UsersIcon className="w-6 h-6 text-purple-600" />, gradient: "from-purple-500 to-purple-600", bg: "from-purple-50 to-purple-100" },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { text: "Audit completed for Mumbai Branch", time: "1h ago", type: "success", icon: <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> },
      { text: "Notification sent to Rajesh Kumar", time: "3h ago", type: "info", icon: <InformationCircleIcon className="w-4 h-4 text-blue-600" /> },
      { text: "Audit report submitted for South Zone", time: "5h ago", type: "success", icon: <CheckCircleIcon className="w-4 h-4 text-emerald-600" /> },
      { text: "Follow-up required for Pune outlet", time: "1d ago", type: "warning", icon: <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" /> },
      { text: "New salesman onboarded: Amit Patel", time: "2d ago", type: "info", icon: <InformationCircleIcon className="w-4 h-4 text-blue-600" /> },
    ],
    []
  );

  const chartData = useMemo(
    () => [
      { month: 'Jan', audits: 15 }, { month: 'Feb', audits: 22 }, { month: 'Mar', audits: 18 },
      { month: 'Apr', audits: 28 }, { month: 'May', audits: 35 }, { month: 'Jun', audits: 42 },
    ],
    []
  );

  useEffect(() => {
    stats.forEach((s, i) => {
      let start = 0;
      const step = Math.ceil(s.value / 50);
      const animate = () => {
        start += step;
        if (start >= s.value) {
          start = s.value;
          setValues(v => { const nv = [...v]; nv[i] = start; return nv; });
        } else {
          setValues(v => { const nv = [...v]; nv[i] = start; return nv; });
          requestAnimationFrame(animate);
        }
      };
      setTimeout(() => requestAnimationFrame(animate), i * 100);
    });
  }, [stats]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const typeStyles = {
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    info:    'border-blue-200 bg-blue-50',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 py-7">
        <header className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <DocumentCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">Auditor Dashboard</h1>
          <p className="mt-4 text-xl text-gray-600">Track your audit progress and performance</p>
          <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />{time.toLocaleTimeString()}
          </div>
        </header>

        <section className="grid gap-6 mb-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="relative bg-white/80 rounded-3xl p-6 shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient} rounded-3xl opacity-10`} />
              <div className="relative">
                <div className="flex justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${s.bg}`}>{s.icon}</div>
                  <div className="flex items-center text-sm">
                    {s.trend === 'up' ? <ArrowUpIcon className="w-4 h-4 text-emerald-500" /> : <ArrowDownIcon className="w-4 h-4 text-red-500" />}
                    <span className={s.trend==='up'?'text-emerald-600':'text-red-600'}>{s.change}</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{s.name}</h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">{values[i]}</p>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.gradient}`} style={{ width: `${(values[i]/s.value)*100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-8 mb-12 lg:grid-cols-2">
          <div className="bg-white/80 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Audits Trend</h3>
            <div className="h-64 flex items-end space-x-2">
              {chartData.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg" style={{ height: `${(d.audits/45)*200}px` }} />
                  <span className="mt-2 text-sm text-gray-600">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-3 overflow-y-auto max-h-80">
              {activities.map((a,i) => (
                <div key={i} className={`flex items-start space-x-3 p-3 rounded-2xl border ${typeStyles[a.type]}`}>
                  {a.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{a.text}</p>
                  </div>
                  <span className="text-xs text-gray-500">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}