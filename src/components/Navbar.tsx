import { NavLink } from 'react-router-dom';
import { CalendarDays, CheckSquare, Plus, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <CalendarDays className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">会议纪要追踪器</span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
              >
                <CalendarDays className="h-4 w-4 mr-1.5" />
                会议列表
              </NavLink>
              <NavLink
                to="/todos"
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
              >
                <CheckSquare className="h-4 w-4 mr-1.5" />
                待办事项
              </NavLink>
              <NavLink
                to="/reminders"
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )
                }
              >
                <BellRing className="h-4 w-4 mr-1.5" />
                待办提醒
              </NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <NavLink
              to="/meetings/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              新建会议
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
