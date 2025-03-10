// src/components/TheaterForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theaterApi, TheaterDTO } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TheaterFormProps {
  mode: 'create' | 'edit';
}

const TheaterForm = ({ mode }: TheaterFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  
  const [theater, setTheater] = useState<Omit<TheaterDTO, 'id'>>({
    name: '',
    address: '',
    seatCount: 0,
    managerId: null,
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchTheater = async () => {
        try {
          const data = await theaterApi.getTheaterById(parseInt(id));
          setTheater({
            name: data.name,
            address: data.address,
            seatCount: data.seatCount,
            managerId: data.managerId,
          });
        } catch (error) {
          setError('Failed to fetch theater details');
          console.error('Error fetching theater:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTheater();
    }
  }, [id, mode]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/theaters');
    }
  }, [isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'seatCount') {
      setTheater({
        ...theater,
        [name]: parseInt(value) || 0,
      });
    } else {
      setTheater({
        ...theater,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await theaterApi.createTheater(theater);
      } else if (mode === 'edit' && id) {
        await theaterApi.updateTheater(parseInt(id), theater);
      }
      navigate('/theaters');
    } catch (error) {
      setError(`Failed to ${mode} theater`);
      console.error(`Error ${mode}ing theater:`, error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null; // Don't render anything while redirecting

  return (
    <div className="theater-form">
      <h2>{mode === 'create' ? 'Add New Theater' : 'Edit Theater'}</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Theater Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={theater.name}
            onChange={handleChange}
            required
            maxLength={120}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={theater.address}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="seatCount">Seat Count</label>
          <input
            type="number"
            id="seatCount"
            name="seatCount"
            value={theater.seatCount}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit">{mode === 'create' ? 'Create' : 'Update'}</button>
          <button type="button" onClick={() => navigate('/theaters')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TheaterForm;