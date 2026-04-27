import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_URL = "${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api";

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/doctors/`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="section-padding">
      <div className="container">
        <header className="flex flex-col gap-md mb-huge" style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: '56px' }}>Our Expert Practitioners</h1>
          <p style={{ maxWidth: '600px', color: 'var(--on-surface-variant)' }}>Find the right doctor for your unique health needs. All our practitioners are certified and rigorously vetted.</p>
          
          <div className="flex gap-md items-center mt-lg" style={{ maxWidth: '800px' }}>
            <div className="flex items-center gap-md" style={{ flex: 1, backgroundColor: 'var(--surface-low)', padding: '16px 24px', borderRadius: 'var(--radius-xl)' }}>
              <Search size={20} className="text-primary" />
              <input 
                type="text" 
                placeholder="Search doctors, specialties..." 
                style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-sm btn-secondary">
              <Filter size={18} /> Filters
            </button>
          </div>
        </header>

        {isLoading ? (
            <div className="flex justify-center p-huge">
                <p>Loading expert practitioners...</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-lg">
            {filteredDoctors.map((d, i) => (
                <motion.div 
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card flex flex-col gap-md"
                >
                <div className="flex gap-lg items-center">
                    <img src={d.image || `https://i.pravatar.cc/150?u=${d.id}`} alt={d.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', background: 'var(--surface-high)' }} />
                    <div className="flex flex-col">
                    <h3 style={{ fontSize: '20px' }}>{d.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>{d.specialization}</p>
                    </div>
                </div>
                
                <div className="flex justify-between items-center" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
                    <div className="flex items-center gap-sm" style={{ fontSize: '14px' }}>
                    <Star size={16} fill="var(--primary)" className="text-primary" />
                    <span>{d.rating || '4.9'} ({(d.id * 13) % 100 + 40})</span>
                    </div>
                    <div className="flex items-center gap-sm" style={{ fontSize: '14px' }}>
                    <Clock size={16} />
                    <span>{d.experience}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-md">
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>{d.consultation_fee > 0 ? `â‚¹${d.consultation_fee}` : 'Consultation'}</span>
                    <Link to={`/booking/${d.id}`} className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px', textDecoration: 'none' }}>Book Now</Link>
                </div>
                </motion.div>
            ))}
            {filteredDoctors.length === 0 && !isLoading && (
                <div className="col-span-3 text-center p-huge">
                    <p style={{ color: 'var(--on-surface-variant)' }}>No practitioners found matching your search.</p>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
