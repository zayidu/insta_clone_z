import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../App';
import Spinner from '../widgets/Spinner';

const Profile = () => {
  const [mypics, setPics] = useState([]);
  const [newpicBool, setnewpicBool] = useState(false);
  const { state, dispatch } = useContext(UserContext);
  const [image, setImage] = useState('');

  useEffect(() => {
    fetch('/api/post/myposts', {
      headers: {
        token: localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setPics(result.mypost);
      });
  }, []);

  useEffect(() => {
    if (image) {
      const data = new FormData();
      data.append('file', image);
      data.append('upload_preset', 'insta_clone_z');
      data.append('cloud_name', 'zayidu');
      fetch('https://api.cloudinary.com/v1_1/zayidu/image/upload', {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          fetch('/api/user/updateprofilepic', {
            method: 'put',
            headers: {
              'Content-Type': 'application/json',
              token: localStorage.getItem('jwt'),
            },
            body: JSON.stringify({
              pic: data.url,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              //   console.log(result);
              localStorage.setItem(
                'user',
                JSON.stringify({ ...state, pic: result.pic })
              );
              setnewpicBool(false);
              dispatch({ type: 'UPDATEPIC', payload: result.pic });
              //window.location.reload()
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [image]);

  const updatePhoto = (file) => {
    // document.getElementById("profileImage").setImage('')
    setImage(file);
    setnewpicBool(true);
  };
  return (
    <div style={{ maxWidth: '550px', margin: '0px auto' }}>
      <div
        style={{
          margin: '18px 0px',
          borderBottom: '1px solid grey',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <div>
            {state && !newpicBool ? (
              <img
                id="profileImage"
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '80px',
                }}
                src={state && state.pic}
              />
            ) : (
              <Spinner />
            )}
          </div>
          <div>
            <h4>{state ? state.name : 'loading'}</h4>
            <h5>{state ? state.email : 'loading'}</h5>
            <div
              className="follow_list"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '108%',
              }}
            >
              <h6>{mypics.length} posts</h6>
              <h6>{state ? state.followers.length : '0'} followers</h6>
              <h6>{state ? state.following.length : '0'} following</h6>
            </div>
          </div>
        </div>

        <div className="file-field input-field" style={{ margin: '10px' }}>
          <div className="btn #64b5f6 blue darken-1">
            <span>Upload a new image</span>
            <input
              type="file"
              onChange={(e) => updatePhoto(e.target.files[0])}
            />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
      </div>
      <div className="gallery">
        {!mypics ? (
          <Spinner />
        ) : (
          mypics.map((item) => {
            return (
              <img
                key={item._id}
                className="item"
                src={item.photo}
                alt={item.title}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Profile;
