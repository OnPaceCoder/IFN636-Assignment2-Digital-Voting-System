import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateCandidatePage from './pages/candidates/CreateCandidatePage';
import AdminCandidatesList from './pages/candidates/AdminCandidatesList';
import EditCandidatePage from './pages/candidates/EditCandidatePage';
import VotePage from './pages/voting/VotePage';
import MyVotePage from './pages/voting/MyVotePage';
import LandingPage from './pages/LandingPage';
import ElectionListPage from './pages/elections/ListElections';
import AdminDashboardPage from './pages/Dashboard/Dashboard';
import AdminElectionsList from './pages/elections/AdminListElection';
import CreateElectionPage from './pages/elections/AddElection';
import EditElectionPage from './pages/elections/EditElectionPage';
import ArchiveElection from './pages/elections/ArchiveElection';
import ElectionResultsPage from './pages/elections/AdminResultsPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-candidate" element={<CreateCandidatePage />} />
        <Route path="/list-candidates" element={<AdminCandidatesList />} />
        <Route path="/update-candidate/:id/edit" element={<EditCandidatePage />} />
        <Route path="/elections" element={<ElectionListPage />} />
        <Route path="/create-election" element={<CreateElectionPage />} />
        <Route path="/list-elections" element={<AdminElectionsList />} />
        <Route path="/update-election/:id/edit" element={<EditElectionPage />} />
        <Route path="/archived-elections" element={<ArchiveElection />} />
        <Route path="/elections/:electionId" element={<VotePage />} />
        <Route path="/add-vote" element={<VotePage />} />
        <Route path="/my-vote" element={<MyVotePage />} />
        <Route path='/dashboard' element={<AdminDashboardPage />} />
        <Route path='/results' element={<ElectionResultsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
