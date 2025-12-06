import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'; // Adjust path as needed

const Dashboard = () => {
  // Define what happens when 's' is pressed
  useKeyboardShortcut('s', () => {
    console.log("Search activated!");
    // logic to open search bar
  });

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};
export default Dashboard;