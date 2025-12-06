import React from 'react';

function diffDays(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function percent(part, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

function AccountServiceDetailPage({ member, serviceIndex = 0, setPage }) {
  // If member exists but has NO services, show upsell / account interface
  if (member && (!member.services || member.services.length === 0)) {
    return (
      <div className="animate-fadeIn min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="account-details-card max-w-xl w-full text-center">
          <h2 className="text-xl font-semibold mb-2">
            No active services found
          </h2>
          <p className="text-gray-600 mb-4">
            Your account is created, but you have not yet joined Talim, Hostel,
            Library or other programs.
          </p>
          <p className="text-gray-600 mb-6">
            Choose a service to get started, or go back to your account
            overview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPage({ name: 'services' })}
              className="px-5 py-2.5 rounded-full bg-pink-600 text-white font-semibold text-sm"
            >
              View Services & Join
            </button>
            <button
              onClick={() => setPage({ name: 'account' })}
              className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-800 font-semibold text-sm bg-white"
            >
              ← Back to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If member or specific service is missing, fallback
  if (!member || !member.services || !member.services[serviceIndex]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl px-8 py-6">
          <p className="text-gray-700 mb-4">No service data found.</p>
          <button
            onClick={() => setPage({ name: 'account' })}
            className="px-4 py-2 rounded-full bg-pink-600 text-white text-sm font-semibold"
          >
            ← Back to My Account
          </button>
        </div>
      </div>
    );
  }

  const svc = member.services[serviceIndex];

  const today = new Date();
  const totalDays = diffDays(svc.subscriptionDate, svc.expiryDate);
  const usedDays = diffDays(svc.subscriptionDate, today);
  const usedDaysClamped = Math.min(usedDays, totalDays || usedDays);
  const remainingDays = Math.max(0, totalDays - usedDaysClamped);

  const totalFee = svc.totalFee || 0;
  const paidFee = svc.feePaid || 0;
  const pendingFee = totalFee - paidFee;

  const dayPercent = percent(usedDaysClamped, totalDays || usedDaysClamped || 1);
  const feePercent = percent(paidFee, totalFee || paidFee || 1);

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50 pb-16">
      {/* Hero */}
      <section className="service-detail-hero">
        <div className="service-detail-hero-inner">
          <button
            className="service-detail-back"
            onClick={() => setPage({ name: 'account' })}
          >
            ← Back to My Account
          </button>
          <h1>{svc.serviceName}</h1>
          <p>
            Member: <strong>{member.name}</strong> • Email: {member.email}
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="service-detail-main">
        <div className="service-detail-grid">
          {/* Left: timeline */}
          <div className="service-detail-card">
            <h2>Service Timeline</h2>
            <ul>
              <li>Admission date: {formatDate(svc.subscriptionDate)}</li>
              <li>End date: {formatDate(svc.expiryDate)}</li>
              <li>Total duration: {totalDays} days</li>
              <li>Days completed: {usedDaysClamped} days</li>
              <li>Days remaining: {remainingDays} days</li>
            </ul>

            <h3>Days Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2 mb-1 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                style={{ width: `${dayPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              {dayPercent}% of period completed
            </p>
          </div>

          {/* Right: payments */}
          <div className="service-detail-card pricing">
            <h2>Payments Overview</h2>
            <p className="service-detail-price">{totalFee}</p>
            <p className="service-detail-note">
              Total fee: ₹{totalFee.toLocaleString('en-IN')}
              <br />
              Paid: ₹{paidFee.toLocaleString('en-IN')} • Pending:{' '}
              ₹{pendingFee.toLocaleString('en-IN')}
            </p>

            <h3>Payment Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2 mb-1 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${feePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-700">
              {feePercent}% of fee paid
            </p>

            <button
              className="service-detail-secondary-btn mt-4"
              onClick={() =>
                setPage({ name: 'service-detail', params: { id: svc.serviceId } })
              }
            >
              View Service Info / Renew
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AccountServiceDetailPage;
