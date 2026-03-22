import React from 'react';
import {
    Search, Filter, Download, Plus, Calendar, Eye, Edit2, Trash2, ChevronRight, ChevronLeft
} from 'lucide-react';

const appointments = [
    { id: 1, patient: 'John Smith', email: 'john.s@example.com', phone: '+62 812-3456-789', avatar: 'https://i.pravatar.cc/150?u=1', doctor: 'Dr. Sarah Johnson', date: '2023-07-15', time: '10:00 AM', status: 'Confirmed', type: 'Check-up', duration: '30 min', lastVisit: '2023-01-10', payment: 'Paid' },
    { id: 2, patient: 'Emily Davis', email: 'emily.d@example.com', phone: '+62 812-9876-543', avatar: 'https://i.pravatar.cc/150?u=2', doctor: 'Dr. Michael Chen', date: '2026-03-21', time: '11:30 AM', status: 'In Progress', type: 'Consultation', duration: '45 min', lastVisit: '2025-12-20', payment: 'Pending' },
    { id: 3, patient: 'Robert Wilson', email: 'rob.w@example.com', phone: '+62 813-1122-334', avatar: 'https://i.pravatar.cc/150?u=3', doctor: 'Dr. Lisa Patel', date: '2026-03-21', time: '02:15 PM', status: 'Completed', type: 'Follow-up', duration: '20 min', lastVisit: '2026-02-15', payment: 'Paid' },
    { id: 4, patient: 'Jessica Brown', email: 'jess.b@example.com', phone: '+62 811-5566-778', avatar: 'https://i.pravatar.cc/150?u=4', doctor: 'Dr. James Wilson', date: '2023-07-25', time: '09:00 AM', status: 'Confirmed', type: 'Dental Cleaning', duration: '60 min', lastVisit: '2023-05-01', payment: 'Unpaid' },
];

export default function AppointmentsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your clinic's appointments and schedules.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors bg-white">
                        <Calendar size={16} /> Calendar View
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
                        <Plus size={16} /> New Appointment
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-100">
                {['All Appointments', 'Upcoming', 'Today', 'Completed', 'Cancelled'].map((tab, i) => (
                    <button
                        key={tab}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            i === 0 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Table Controls */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">All Appointments</h2>
                        <p className="text-xs text-slate-500">View and manage all scheduled appointments.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-64"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><Filter size={18} className="text-slate-600" /></button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><Download size={18} className="text-slate-600" /></button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Table Wrapper for Horizontal Scroll */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {/* Sticky Column Header */}
                                <th className="sticky left-0 z-20 bg-slate-50 px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    Patient
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider min-w-50">Contact Info</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider min-w-45">Doctor</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider min-w-40">Date & Time</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider min-w-40">Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Last Visit</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Payment</th>
                                <th className="sticky right-0 z-20 bg-slate-50 px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {appointments.map((apt) => (
                                <tr key={apt.id} className="group hover:bg-slate-50/30 transition-colors">
                                    {/* Sticky Patient Cell */}
                                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-6 py-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={apt.avatar} className="w-9 h-9 rounded-full border border-slate-100" alt="" />
                                            <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{apt.patient}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-700">{apt.email}</span>
                                            <span className="text-[11px] text-slate-400">{apt.phone}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{apt.doctor}</td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm font-bold text-slate-900 whitespace-nowrap">
                                            {apt.date}
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{apt.time}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        apt.status === 'Confirmed' ? 'text-blue-600 border-blue-100 bg-blue-50/50' : 'text-orange-600 border-orange-100 bg-orange-50/50'
                    }`}>
                        {apt.status}
                    </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{apt.type}</td>

                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">{apt.lastVisit}</td>

                                    <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${apt.payment === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {apt.payment}
                  </span>
                                    </td>

                                    {/* Sticky Actions Cell */}
                                    <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 px-6 py-4 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={17} /></button>
                                            <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={17} /></button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={17} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>



            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Show</span>
                    <select className="bg-white border border-slate-200 rounded-md text-xs font-bold py-1 px-2 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                    <span className="text-xs text-slate-500 font-medium">results per page</span>
                </div>

                <div className="flex items-center gap-6">
    <span className="text-xs text-slate-500 font-medium">
      Page <span className="text-slate-900 font-bold">1</span> of <span className="text-slate-900 font-bold">12</span>
    </span>

                    <div className="flex items-center gap-1">
                        <button
                            disabled
                            className="p-2 text-slate-300 cursor-not-allowed border border-transparent transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, '...', 12].map((page, i) => (
                                <button
                                    key={i}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                        page === 1
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                            : 'text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-200 border border-transparent rounded-lg transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
}