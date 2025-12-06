const ContactInfoCard = ({ icon, title, text }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

export default ContactInfoCard;
