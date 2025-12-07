import React from 'react';

// Minimal Starter/Animation placeholder component.
// The original animated implementation was commented out to avoid heavy runtime
// dependencies during development. Keep the commented original above for
// reference; this lightweight component prevents invalid import errors.
function StarterAnimaPage({ setPage }) {
	return (
		<div style={{ padding: 40, textAlign: 'center' }}>
			<h1 style={{ marginBottom: 8 }}>Welcome to Shivba</h1>
			<p style={{ marginBottom: 18 }}>Loading the site — click continue to enter.</p>
			<div>
				<button className="shivba-primary-btn" onClick={() => setPage({ name: 'home' })}>Continue</button>
			</div>
		</div>
	);
}

export default StarterAnimaPage;