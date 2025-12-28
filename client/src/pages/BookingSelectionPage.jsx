import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA GENERATION ---
const ROOM_DATA = {
  room1: {
    id: 'r1', name: 'Room 1 (Kitchen Side)', 
    beds: [
      { id: '5', status: 'available', type: 'lower' }, { id: '6', status: 'booked', type: 'upper' }, 
      { id: '1', status: 'available', type: 'lower' }, { id: '7', status: 'available', type: 'upper' },
      { id: '2', status: 'booked', type: 'lower' }, { id: '8', status: 'available', type: 'upper' },
      { id: '3', status: 'available', type: 'lower' }, { id: '9', status: 'maintenance', type: 'upper' },
      { id: '4', status: 'available', type: 'lower' }, { id: '10', status: 'booked', type: 'upper' },
    ]
  },
  room2: {
    id: 'r2', name: 'Room 2 (Garden Side)',
    beds: [
      { id: '11', status: 'available', type: 'lower' }, { id: '12', status: 'available', type: 'upper' },
      { id: '13', status: 'booked', type: 'lower' }, { id: '14', status: 'available', type: 'upper' },
      { id: '15', status: 'available', type: 'lower' }, { id: '16', status: 'booked', type: 'upper' },
      { id: '17', status: 'available', type: 'lower' }, { id: '18', status: 'available', type: 'upper' },
      { id: '19', status: 'available', type: 'lower' }, { id: '20', status: 'maintenance', type: 'upper' },
      { id: '35', status: 'available', type: 'lower' }, { id: '36', status: 'available', type: 'upper' },
      { id: '37', status: 'available', type: 'lower' }, { id: '38', status: 'booked', type: 'upper' },
      { id: '21', status: 'available', type: 'lower' }, { id: '22', status: 'available', type: 'upper' },
    ]
  },
  room3: {
    id: 'r3', name: 'Room 3 (New Wing)',
    beds: [
      { id: '23', status: 'available', type: 'lower' }, { id: '24', status: 'booked', type: 'upper' },
      { id: '25', status: 'available', type: 'lower' }, { id: '26', status: 'available', type: 'upper' },
      { id: '27', status: 'maintenance', type: 'lower' }, { id: '28', status: 'available', type: 'upper' },
      { id: '29', status: 'available', type: 'lower' }, { id: '30', status: 'booked', type: 'upper' },
      { id: '31', status: 'booked', type: 'lower' }, { id: '32', status: 'available', type: 'upper' },
      { id: '33', status: 'available', type: 'lower' }, { id: '34', status: 'available', type: 'upper' },
    ]
  }
};

// Generate 200 seats (20 tables of 10)
// Tables 1-18: Lockers | Tables 19-20: Racks
const LIBRARY_DATA = (() => {
  const tables = [];
  for (let i = 0; i < 20; i++) {
    const isLastTwoLines = i >= 18; 
    const seats = Array.from({ length: 10 }, (_, j) => ({
      id: `L${(i * 10) + j + 1}`, 
      status: Math.random() > 0.4 ? 'available' : 'booked',
      type: 'seat'
    }));
    tables.push({ id: `T${i + 1}`, seats, hasLocker: !isLastTwoLines });
  }
  return tables;
})();

// --- MAIN COMPONENT ---
function BookingSelectionPage({ serviceId, setPage, previousPageParams }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeRoom, setActiveRoom] = useState('room1');
  const isHostel = serviceId === 'hostel';

  const handleSelect = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot(prev => prev?.id === slot.id ? null : slot);
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setPage({
      name: 'service-checkout',
      params: { 
        id: serviceId, 
        selectedPlanIndex: previousPageParams?.selectedPlanIndex || 0,
        bookingSlot: selectedSlot 
      }
    });
  };

  return (
    <motion.div 
      className="booking-page"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "circOut" }}
    >
      {/* INJECTED CSS */}
      <style>{`
        .booking-page {
           min-height: 100vh; background: #f0f2f5; font-family: 'Montserrat', sans-serif;
           display: flex; flex-direction: column; overflow: hidden;
        }
        .bp-header {
           padding: 1.5rem 2rem; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
           display: flex; justify-content: space-between; align-items: center; z-index: 10;
        }
        .bp-title h2 { margin: 0; font-family: 'Cinzel', serif; color: #1a1a1a; font-size: 1.5rem; }
        .bp-title p { margin: 0; color: #666; font-size: 0.9rem; }
        .bp-close-btn {
           background: #f3f4f6; border: none; width: 40px; height: 40px; border-radius: 50%;
           cursor: pointer; font-size: 1.2rem; color: #333; transition: all 0.2s;
        }
        .bp-close-btn:hover { background: #e5e7eb; transform: rotate(90deg); }

        .bp-content {
           flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column;
        }
        
        /* TABS (Hostel) */
        .bp-tabs {
           display: flex; justify-content: center; gap: 15px; padding: 1rem;
        }
        .bp-tab {
           padding: 8px 20px; border-radius: 30px; border: none; cursor: pointer;
           background: white; color: #666; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
           transition: all 0.3s; position: relative;
        }
        .bp-tab.active { background: #1a1a1a; color: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

        /* CANVAS AREA */
        .bp-canvas {
           flex: 1; padding: 20px; display: flex; justify-content: center; align-items: flex-start; overflow: auto; background: #eef2f6;
        }
        .map-frame {
           background: white; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.1);
           position: relative; border: 1px solid #ddd; overflow: hidden;
           margin: auto;
        }
        
        /* FOOTER */
        .bp-footer {
           background: white; padding: 1.5rem 2rem; box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
           display: flex; justify-content: space-between; align-items: center; z-index: 10;
        }
        .legend { display: flex; gap: 15px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #555; }
        .dot { width: 10px; height: 10px; border-radius: 2px; }
        .dot.avail { background: white; border: 1px solid #22c55e; }
        .dot.booked { background: #e5e7eb; border: 1px solid #d1d5db; }
        .dot.selected { background: #ea580c; border: 1px solid #ea580c; }

        .confirm-btn {
           background: #ea580c; color: white; padding: 12px 30px; border-radius: 8px; border: none;
           font-weight: bold; cursor: pointer; font-size: 1rem; box-shadow: 0 5px 15px rgba(234, 88, 12, 0.4);
           transition: transform 0.2s;
        }
        .confirm-btn:hover { transform: scale(1.05); background: #c2410c; }
        .confirm-btn:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; transform: none; }

        /* --- HOSTEL MAP STYLES --- */
        .hostel-map-base { width: 800px; height: 400px; position: relative; background: #fff; }
        .bed-box {
           display: flex; align-items: center; justify-content: center; cursor: pointer;
           transition: all 0.2s; font-size: 0.7rem; font-weight: 600; border: 1px solid #333; background: white;
        }
        
        /* --- LIBRARY MAP STYLES --- */
        .library-grid-base { 
           width: 1000px; height: auto; min-height: 100%; padding: 40px; 
           display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
        }

        .table-pair {
            display: flex; flex-direction: column; margin-bottom: 30px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;
        }
        .table-divider { height: 4px; background: #d1d5db; width: 100%; }

        .lib-unit { display: flex; flex-direction: column; }
        .lib-unit.inverted { flex-direction: column-reverse; } /* Swaps Seat/Desk order */

        .lib-seat-row { display: flex; height: 35px; gap: 4px; padding: 0 4px; background: #fff; }
        
        /* Attractive Chair Styling */
        .lib-seat { 
            flex: 1; border: 1px solid #ccc; background: white; 
            border-radius: 6px 6px 2px 2px; /* Chair shape top */
            margin-top: 4px; cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.7rem; font-weight: bold; color: #555;
            box-shadow: 0 2px 0 #ddd;
        }
        .lib-unit.inverted .lib-seat {
            border-radius: 2px 2px 6px 6px; /* Chair shape bottom */
            margin-top: 0; margin-bottom: 4px; box-shadow: 0 -2px 0 #ddd;
        }

        /* Attractive Desk Styling */
        .lib-desk-row { display: flex; height: 45px; background: #e8dcc4; /* Wood color */ border: 1px solid #d4c5a9; }
        .lib-desk-box { 
            flex: 1; border-right: 1px solid #cfbfa2; 
            display: flex; align-items: center; justify-content: center; position: relative;
        }
        
        /* Locker Visuals */
        .locker-visual {
            width: 70%; height: 70%; background: linear-gradient(135deg, #a1a1aa, #d4d4d8);
            border: 1px solid #71717a; border-radius: 3px; position: relative;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
        }
        .locker-visual::after { /* Keyhole */
            content: ''; position: absolute; top: 50%; right: 4px; width: 3px; height: 3px;
            background: #333; border-radius: 50%; transform: translateY(-50%);
        }
        .rack-visual { font-size: 9px; color: #886a4a; font-weight: bold; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; }

        /* States */
        .available:hover { background: #dcfce7; border-color: #22c55e; color: #166534; transform: translateY(-2px); }
        .booked { background: #f3f4f6; color: #d1d5db; border-color: #eee; box-shadow: none; cursor: not-allowed; }
        .maintenance { background: #fee2e2; color: #ef4444; cursor: not-allowed; }
        .selected { 
            background: #ea580c !important; color: white !important; 
            border-color: #ea580c !important; transform: scale(1.1); 
            box-shadow: 0 5px 15px rgba(234, 88, 12, 0.3) !important; z-index: 5;
        }

        .entrance-arrow { position: absolute; font-size: 2.5rem; color: #1a1a1a; opacity: 0.8; }
        .feature-zone {
            position: absolute; border: 2px dashed #ccc; background: #fafafa;
            display: flex; align-items: center; justify-content: center;
            color: #999; font-weight: bold; font-size: 0.8rem; letter-spacing: 1px;
        }

      `}</style>

      {/* HEADER */}
      <div className="bp-header">
        <div className="bp-title">
          <h2>Select {isHostel ? 'Bed' : 'Seat'}</h2>
          <p>{isHostel ? 'Choose your preferred room & bunk' : 'Choose a quiet spot for study'}</p>
        </div>
        <button className="bp-close-btn" onClick={() => setPage({ name: 'services', params: { serviceId } })}>✕</button>
      </div>

      <div className="bp-content">
        {/* HOSTEL TABS */}
        {isHostel && (
          <div className="bp-tabs">
            {['room1', 'room2', 'room3'].map(room => (
              <button 
                key={room} 
                className={`bp-tab ${activeRoom === room ? 'active' : ''}`}
                onClick={() => { setActiveRoom(room); setSelectedSlot(null); }}
              >
                {room.replace('room', 'Room ')}
              </button>
            ))}
          </div>
        )}

        {/* MAP CANVAS */}
        <div className="bp-canvas">
          <motion.div 
            className="map-frame"
            key={isHostel ? activeRoom : 'library'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ 
                width: isHostel ? '800px' : 'auto', 
                height: isHostel ? '400px' : 'auto',
                border: isHostel ? '4px solid #333' : 'none',
                boxShadow: isHostel ? '' : 'none',
                background: isHostel ? 'white' : 'transparent'
            }}
          >
            {isHostel ? (
               <HostelMap activeRoom={activeRoom} selected={selectedSlot} onSelect={handleSelect} />
            ) : (
               <LibraryMap data={LIBRARY_DATA} selected={selectedSlot} onSelect={handleSelect} />
            )}
          </motion.div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bp-footer">
        <div className="legend">
          <div className="legend-item"><div className="dot avail"></div> Available</div>
          <div className="legend-item"><div className="dot selected"></div> Selected</div>
          <div className="legend-item"><div className="dot booked"></div> Occupied</div>
          {!isHostel && <div className="legend-item" style={{display:'flex', alignItems:'center', gap:'5px'}}><div style={{width:'10px', height:'10px', background:'#a1a1aa', border:'1px solid #71717a'}}></div> Locker</div>}
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
            <AnimatePresence>
                {selectedSlot && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        style={{ textAlign:'right' }}
                    >
                        <div style={{ fontSize:'0.8rem', color:'#666' }}>Selected</div>
                        <div style={{ fontWeight:'bold', fontSize:'1.2rem', color:'#ea580c' }}>
                            {selectedSlot.id}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button className="confirm-btn" disabled={!selectedSlot} onClick={handleConfirm}>
                Confirm Selection
            </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- HOSTEL MAP COMPONENT ---
const HostelMap = ({ activeRoom, selected, onSelect }) => {
    const beds = ROOM_DATA[activeRoom].beds;
    const Pair = ({ u, l, style }) => {
        const upper = beds.find(b => b.id === u);
        const lower = beds.find(b => b.id === l);
        const Box = ({ bed }) => (
            bed ? <div className={`bed-box ${selected?.id === bed.id ? 'selected' : bed.status}`} onClick={() => onSelect(bed)} style={{ flex: 1 }}>{bed.id}</div> : null
        );
        return (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', border:'1px solid #333', ...style }}>
                <Box bed={upper} />
                <Box bed={lower} />
            </div>
        );
    };

    if (activeRoom === 'room1') {
        return (
            <div className="hostel-map-base">
                 <div className="feature-zone" style={{top:'5%', left:'5%', width:'15%', height:'25%'}}>BATH</div>
                 <div className="feature-zone" style={{top:'5%', left:'22%', width:'15%', height:'15%'}}>BATH</div>
                 <div className="feature-zone" style={{top:'5%', right:'5%', width:'30%', height:'20%'}}>BATH</div>
                 <Pair u="6" l="5" style={{ bottom:'10%', left:'5%', width:'12%', height:'35%' }} />
                 <Pair u="7" l="1" style={{ bottom:'10%', left:'22%', width:'10%', height:'35%' }} />
                 <Pair u="8" l="2" style={{ bottom:'10%', left:'34%', width:'10%', height:'35%' }} />
                 <Pair u="9" l="3" style={{ bottom:'10%', left:'46%', width:'10%', height:'35%' }} />
                 <Pair u="10" l="4" style={{ bottom:'10%', left:'58%', width:'10%', height:'35%' }} />
                 <div className="entrance-arrow" style={{ bottom: '20px', right: '40px' }}>⬅</div>
            </div>
        );
    }
    if (activeRoom === 'room2') {
        return (
            <div className="hostel-map-base">
                <Pair u="12" l="11" style={{ top:'5%', left:'5%', width:'10%', height:'25%' }} />
                <Pair u="14" l="13" style={{ top:'5%', left:'18%', width:'10%', height:'25%' }} />
                <Pair u="16" l="15" style={{ top:'5%', left:'31%', width:'10%', height:'25%' }} />
                <Pair u="18" l="17" style={{ top:'5%', left:'44%', width:'10%', height:'25%' }} />
                <Pair u="20" l="19" style={{ top:'5%', left:'57%', width:'10%', height:'25%' }} />
                <Pair u="36" l="35" style={{ bottom:'5%', left:'35%', width:'10%', height:'35%' }} />
                <Pair u="38" l="37" style={{ bottom:'5%', left:'48%', width:'10%', height:'35%' }} />
                <Pair u="22" l="21" style={{ bottom:'5%', right:'5%', width:'12%', height:'35%' }} />
                <div className="entrance-arrow" style={{ top: '20px', right: '80px' }}>⬇</div>
            </div>
        );
    }
    if (activeRoom === 'room3') {
        return (
            <div className="hostel-map-base">
                <div className="entrance-arrow" style={{ top: '45%', left: '20px' }}>➡</div>
                <Pair u="24" l="23" style={{ top:'10%', left:'20%', width:'18%', height:'25%' }} />
                <Pair u="26" l="25" style={{ top:'10%', left:'45%', width:'18%', height:'25%' }} />
                <Pair u="28" l="27" style={{ top:'10%', left:'70%', width:'18%', height:'25%' }} />
                <Pair u="30" l="29" style={{ bottom:'10%', left:'20%', width:'18%', height:'25%' }} />
                <Pair u="32" l="31" style={{ bottom:'10%', left:'45%', width:'18%', height:'25%' }} />
                <Pair u="34" l="33" style={{ bottom:'10%', left:'70%', width:'18%', height:'25%' }} />
            </div>
        );
    }
    return null;
};

// --- LIBRARY MAP COMPONENT (ATTRACTIVE REFACTOR) ---
const LibraryMap = ({ data, selected, onSelect }) => {
    // Helper to render a pair of connected tables (Back to Back)
    const TablePair = ({ tableA, tableB }) => (
        <div className="table-pair">
            {/* Table A: Seats Top, Desk Bottom */}
            {tableA && (
                <div className="lib-unit">
                    <div className="lib-seat-row">
                        {tableA.seats.map(seat => (
                            <div key={seat.id} className={`lib-seat ${selected?.id === seat.id ? 'selected' : seat.status}`} onClick={() => onSelect(seat)}>
                                {seat.id.replace('L', '')}
                            </div>
                        ))}
                    </div>
                    <div className="lib-desk-row">
                        {tableA.seats.map(s => (
                            <div key={'d'+s.id} className="lib-desk-box">
                                {tableA.hasLocker ? <div className="locker-visual"></div> : <div className="rack-visual">RACK</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Divider */}
            <div className="table-divider"></div>

            {/* Table B: Desk Top, Seats Bottom (Inverted) */}
            {tableB && (
                <div className="lib-unit inverted">
                    <div className="lib-seat-row">
                        {tableB.seats.map(seat => (
                            <div key={seat.id} className={`lib-seat ${selected?.id === seat.id ? 'selected' : seat.status}`} onClick={() => onSelect(seat)}>
                                {seat.id.replace('L', '')}
                            </div>
                        ))}
                    </div>
                    <div className="lib-desk-row">
                        {tableB.seats.map(s => (
                            <div key={'d'+s.id} className="lib-desk-box">
                                {tableB.hasLocker ? <div className="locker-visual"></div> : <div className="rack-visual">RACK</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Group tables into pairs (0-1, 2-3, etc.)
    const pairs = [];
    for (let i = 0; i < data.length; i += 2) {
        pairs.push({ a: data[i], b: data[i+1] });
    }

    return (
        <div className="library-grid-base">
            {pairs.map((pair, idx) => (
                <TablePair key={idx} tableA={pair.a} tableB={pair.b} />
            ))}
        </div>
    );
};

export default BookingSelectionPage;