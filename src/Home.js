import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Create a CSS file for styling
import { TestApplication } from './TestApplication'; // Your Rainbow Web SDK manager
import ContactsComponent from './ContactsComponent';
import ConversationsComponent from './ConversationsComponent';
import BubblesComponent from './BubblesComponent';
import InvitationsComponent from './InvitationsComponent';
import CallLogComponent from './CallLogComponent';
import SearchComponent from './SearchComponent';

const Home = () => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Connect and load data (Rainbow Web SDK)
    TestApplication.getInstance().loadRoster();
  }, []);

  useEffect(() => {
  window.ReactNativeWebView?.postMessage("__WEB_READY__");
}, []);


  const renderTab = () => {
    switch (selectedTab) {
      case 1:
        return <ContactsComponent />;
      case 2:
        return <ConversationsComponent />;
      case 3:
        return <BubblesComponent />;
      case 4:
        return <InvitationsComponent />;
      case 5:
        return <CallLogComponent />;
      default:
        return <div>No Data Found</div>;
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setIsSearchMode(!!query);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button onClick={() => navigate('/menu')} className="menu-button">☰</button>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </header>

      {isSearchMode ? (
        <SearchComponent query={searchQuery} />
      ) : (
        <div className="tab-content">{renderTab()}</div>
      )}

      <footer className="home-footer">
        <button onClick={() => setSelectedTab(1)}>Contacts</button>
        <button onClick={() => setSelectedTab(2)}>Chats</button>
        <button onClick={() => setSelectedTab(3)}>Bubbles</button>
        <button onClick={() => setSelectedTab(4)}>Invites</button>
        <button onClick={() => setSelectedTab(5)}>Calls</button>
      </footer>
    </div>
  );
};

export default Home;
