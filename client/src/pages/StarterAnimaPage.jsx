// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Building2, Dumbbell, BookOpen, ArrowRight } from 'lucide-react';
// import './StarterAnimaPage.css';

// // Make sure your video is in src/assets/ or adjust this path
// import shivbaVideo from '../assets/shivba-intro.mp4'; 

// const StarterAnimaPage = ({ setPage }) => {
//   const [loading, setLoading] = useState(true);

//   // Simple timeout to ensure video load doesn't jar the animation
//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 500);
//     return () => clearTimeout(timer);
//   }, []);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { staggerChildren: 0.3, delayChildren: 0.2 }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 30, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1, 
//       transition: { type: "spring", stiffness: 120, damping: 20 } 
//     }
//   };

//   return (
//     <div className="anima-container">
//       {/* Background Video Layer */}
//       <div className="anima-video-wrapper">
//         <video 
//           autoPlay 
//           loop 
//           muted 
//           playsInline 
//           className="anima-bg-video"
//         >
//           <source src={shivbaVideo} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//         {/* Dark Overlay Gradient */}
//         <div className="anima-overlay"></div>
//       </div>

//       {/* Foreground Content */}
//       {!loading && (
//         <motion.div 
//           className="anima-content"
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           {/* Main Title - 3D Gold Effect */}
//           <motion.div className="anima-title-wrapper" variants={itemVariants}>
//             <h1 className="anima-gold-text">SHIVBA</h1>
//             <div className="anima-gold-underline"></div>
//           </motion.div>

//           {/* Icons Grid */}
//           <motion.div className="anima-icons-grid" variants={itemVariants}>
            
//             <div className="anima-icon-item">
//               <div className="anima-icon-box">
//                 <Building2 size={32} />
//               </div>
//               <span>Hostel</span>
//             </div>

//             <div className="anima-icon-item main">
//               <div className="anima-icon-box large">
//                 <Dumbbell size={48} />
//               </div>
//               <span>Gym</span>
//             </div>

//             <div className="anima-icon-item">
//               <div className="anima-icon-box">
//                 <BookOpen size={32} />
//               </div>
//               <span>Library</span>
//             </div>

//           </motion.div>

//           {/* Call to Action */}
//           <motion.button 
//             className="anima-enter-btn"
//             variants={itemVariants}
//             whileHover={{ scale: 1.05, letterSpacing: '5px' }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setPage({ name: 'home' })}
//           >
//             Enter Website <ArrowRight size={18} style={{ marginLeft: '10px' }} />
//           </motion.button>

//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default StarterAnimaPage;