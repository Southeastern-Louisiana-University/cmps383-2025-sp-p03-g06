// src/components/TheaterList.tsx
import { useState, useEffect } from 'react';
import { theaterApi, TheaterDTO } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const TheaterList = () => {
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const data = await theaterApi.getAllTheaters();
        setTheaters(data);
      } catch (error) {
        setError('Failed to fetch theaters');
        console.error('Error fetching theaters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this theater?')) {
      try {
        await theaterApi.deleteTheater(id);
        setTheaters(theaters.filter(theater => theater.id !== id));
      } catch (error) {
        setError('Failed to delete theater');
        console.error('Error deleting theater:', error);
      }
    }
  };

  if (loading) return <div>Loading theaters...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="theater-list">
      <h2>Theaters</h2>
      {isAdmin && (
        <div className="actions">
          <Link to="/theaters/new" className="button">
            Add New Theater
          </Link>
        </div>
      )}
      {theaters.length === 0 ? (
        <p>No theaters found.</p>
      ) : (
        <div className="theaters-grid">
          {theaters.map((theater) => (
            <div key={theater.id} className="theater-card">
              <h3>{theater.name}</h3>
              <p>{theater.address}</p>
              <p>Seats: {theater.seatCount}</p>
              <div className="theater-actions">
                <Link to={`/theaters/${theater.id}`}>View Details</Link>
                {isAdmin && (
                  <>
                    <Link to={`/theaters/edit/${theater.id}`}>Edit</Link>
                    <button onClick={() => handleDelete(theater.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheaterList;