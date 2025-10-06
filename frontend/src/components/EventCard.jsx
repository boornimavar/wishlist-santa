import React from 'react';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

function EventCard({ event, isOwner, onAddWish, onDeleteEvent, onDeleteWish, onReserve }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-gray-600">{formatDate(event.date)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isOwner && onAddWish && (
            <button
              onClick={onAddWish}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <Plus size={16} />
              <span>Add Wish</span>
            </button>
          )}
          {isOwner && onDeleteEvent && (
            <button
              onClick={() => onDeleteEvent(event.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete event"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {event.wishes && event.wishes.length > 0 ? (
          event.wishes.map(wish => (
            <div
              key={wish.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{wish.description}</p>
                {wish.link && (
                  <a
                    href={wish.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center mt-1"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    View Link
                  </a>
                )}
              </div>
              <div className="ml-4 flex items-center space-x-2">
                {wish.reserved ? (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm">
                    {isOwner ? 'Reserved' : 'Already Reserved'}
                  </span>
                ) : isOwner ? (
                  <>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      Available
                    </span>
                    {onDeleteWish && (
                      <button
                        onClick={() => onDeleteWish(wish.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete wish"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => onReserve(wish.id)}
                    className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Reserve
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            {isOwner ? 'No wishes added yet' : 'No wishes yet'}
          </p>
        )}
      </div>
    </div>
  );
}

export default EventCard;