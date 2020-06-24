import React, { useContext, useRef, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../App';
import M from 'materialize-css';
const Navbar = () => {
  // Reference for the div in the below constant: So that it Shows the modal once the search Icon is clicked
  const searchModal = useRef(null);

  const [search, setSearch] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const { state, dispatch } = useContext(UserContext);
  const history = useHistory();

  // Initializing the Modal
  useEffect(() => {
    M.Modal.init(searchModal.current);
  }, []);

  const renderList = () => {
    if (state) {
      return [
        // Logged In
        // Search Button
        <li key="1">
          <i
            data-target="modal1"
            className="large material-icons modal-trigger"
            style={{ color: 'black' }}
          >
            search
          </i>
        </li>,
        <li key="2">
          <Link to="/profile">
            <i
              class="material-icons"
              style={{
                float: 'left',
              }}
            >
              person_pin
            </i>{' '}
            <span
              className="hide-sm"
              style={{
                float: 'right',
              }}
            >
              Profile
            </span>
          </Link>
        </li>,
        <li key="3">
          <Link to="/create">
            <i
              class="material-icons"
              style={{
                float: 'left',
              }}
            >
              add_a_photo
            </i>{' '}
            <span
              className="hide-sm"
              style={{
                float: 'right',
              }}
            >
              Create a Post
            </span>
          </Link>
        </li>,
        <li key="4">
          <Link to="/myfollowingpost">
            <i
              class="material-icons"
              style={{
                float: 'left',
              }}
            >
              group
            </i>
            <span
              className="hide-sm"
              style={{
                float: 'right',
              }}
            >
              My follower's Posts
            </span>
          </Link>
        </li>,
        <li key="5">
          <button
            className="btn #c62828 red darken-3 logoutbtn"
            onClick={() => {
              localStorage.clear();
              dispatch({ type: 'CLEAR' });
              history.push('/signin');
            }}
          >
            Logout
          </button>
        </li>,
      ];
    } else {
      // Logged Out
      return [
        <li key="0">
          <a href="https://zayidu.github.io/portfolio/" target="_blank">
            Developer
          </a>
        </li>,
        <li key="6">
          <Link to="/signin">Signin</Link>
        </li>,
        <li key="7">
          <Link to="/signup">Signup</Link>
        </li>,
      ];
    }
  };

  const fetchUsers = (query) => {
    query.toLowerCase();
    setSearch(query);
    fetch('/api/user/search-users', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    })
      .then((res) => res.json())
      .then((results) => {
        setUserDetails(results.user);
      });
  };
  return (
    <nav>
      <div className="nav-wrapper white">
        <Link to={state ? '/' : '/signin'} className="brand-logo left">
          Instagram
        </Link>
        {/* Public */}
        {/* <Link to="/" className="brand-logo left"> Instagram </Link> */}
        <ul id="nav-mobile" className="right">
          {renderList()}
        </ul>
      </div>

      {/* Search button will display the target once if the button was clicked  */}
      <div
        id="modal1"
        class="modal"
        // Referring the Model
        ref={searchModal}
        style={{ color: 'black' }}
      >
        <div className="modal-content">
          <input
            type="text"
            placeholder="search users"
            value={search}
            onChange={(e) => fetchUsers(e.target.value)}
          />
          {/* Displaying the collections once Search Result is updated */}
          <ul className="collection">
            {userDetails.map((item) => {
              return (
                <Link
                  to={
                    item._id !== state._id ? '/profile/' + item._id : '/profile'
                  }
                  onClick={() => {
                    M.Modal.getInstance(searchModal.current).close();
                    setSearch('');
                  }}
                >
                  <li className="collection-item">{item.name}</li>
                </Link>
              );
            })}
          </ul>
        </div>
        <div className="modal-footer">
          <button
            className="modal-close waves-effect waves-green btn-flat"
            onClick={() => setSearch('')}
          >
            close
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
