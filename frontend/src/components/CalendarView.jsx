import React from 'react';

function CalendarView({ currentDate, setCurrentDate, events, onDateClick }) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const formatDateString = (date, day) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getEventsForDate = (dateString) => {
    return events.filter(event => event.date === dateString);
  };

  const days = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          ←
        </button>
        <span className="font-medium">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dateString = day ? formatDateString(currentDate, day) : null;
          const dayEvents = dateString ? getEventsForDate(dateString) : [];

          return (
            <div
              key={index}
              className={`p-3 h-24 border rounded cursor-pointer hover:bg-gray-50 ${
                day ? 'bg-white' : 'bg-gray-50'
              } ${dayEvents.length > 0 ? 'bg-red-50 border-red-200' : 'border-gray-200'}`}
              onClick={() => day && onDateClick(dateString)}
            >
              {day && (
                <>
                  <div className="text-sm font-medium">{day}</div>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded mt-1 truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarView;