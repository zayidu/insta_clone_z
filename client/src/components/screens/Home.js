import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { Link } from 'react-router-dom';
import Spinner from '../widgets/Spinner';

const Home = () => {
  const [data, setData] = useState([]);
  const [comment, setComment] = useState('');
  const { state, dispatch } = useContext(UserContext);

  useEffect(() => {
    fetch('/api/post/allposts', {
      headers: {
        token: localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        setData(result.posts);
      });
  }, []);

  // Like a Post
  const likePost = (id) => {
    fetch('/api/post/like', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        //   console.log(result)
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        // console.log(newData);
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // UnLike a Post
  const unlikePost = (id) => {
    fetch('/api/post/unlike', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        //   console.log(result)
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Comment On a Post
  const makeComment = (e, postId) => {
    if (comment.trim()) {
      // let text = e.target[0].value;
      let text = comment.trim();
      // console.log(text);
      fetch('/api/post/comment', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('jwt'),
        },
        body: JSON.stringify({
          postId,
          text,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log('Comments', result);
          const commentsInputs = document.querySelectorAll('.comments');
          commentsInputs.forEach((comment) => {
            comment.reset();
          });

          const newData = data.map((item) => {
            if (item._id == result._id) {
              return result;
            } else {
              return item;
            }
          });
          console.log('New', newData);
          setData(newData);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // Delete a Post /api/post/deletepost/:postId
  const deletePost = (postid) => {
    fetch(`/api/post/deletepost/${postid}`, {
      method: 'delete',
      headers: {
        token: localStorage.getItem('jwt'),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      });
  };

  return (
    <div className="home">
      {!data ? (
        <Spinner />
      ) : (
        data.map((item) => {
          return (
            <div className="card home-card" key={item._id}>
              <h5
                style={{
                  padding: '10px',
                }}
              >
                <Link
                  to={
                    item.postedBy._id !== state._id
                      ? '/profile/' + item.postedBy._id
                      : '/profile'
                  }
                >
                  <img
                    style={{
                      width: '20px',
                      borderRadius: '10px',
                    }}
                    src={item.postedBy && item.postedBy.pic}
                  />
                  <span className="username">{item.postedBy.name}</span>
                </Link>{' '}
                {item.postedBy._id == state._id && (
                  <i
                    className="material-icons"
                    style={{
                      float: 'right',
                    }}
                    onClick={() => deletePost(item._id)}
                  >
                    delete
                  </i>
                )}
              </h5>

              <div className="card-image">
                <img src={item.photo} />
              </div>
              <div className="card-content">
                {/* Like / Unlike Button */}
                {item.likes.includes(state._id) ? (
                  <i
                    className="material-icons"
                    // Method to Unlike as it is already Liked
                    onClick={() => {
                      unlikePost(item._id);
                    }}
                    style={{ color: 'red' }}
                  >
                    {/* like Button */}
                    favorite
                  </i>
                ) : (
                  <i
                    className="material-icons"
                    // Method to Like as it is already UnLiked
                    onClick={() => {
                      likePost(item._id);
                    }}
                  >
                    {/* Unlike Button */}
                    favorite_border
                  </i>
                )}
                {/* {item.likes.includes(state._id) ? (
                  <i
                    className="material-icons"
                    onClick={() => {
                      unlikePost(item._id);
                    }}
                  >
                    thumb_down
                  </i>
                ) : (
                  <i
                    className="material-icons"
                    onClick={() => {
                      likePost(item._id);
                    }}
                  >
                    thumb_up
                  </i>
                )} */}

                <h6>{item.likes.length} likes</h6>
                <h6>{item.title}</h6>
                <p>{item.body}</p>
                {item.comments.map((record) => {
                  return (
                    <h6 key={record._id}>
                      <span style={{ fontWeight: '500' }}>
                        {record.postedBy.name}
                      </span>{' '}
                      {record.text}
                    </h6>
                  );
                })}
                <form
                  className="comments"
                  onSubmit={(e) => {
                    e.preventDefault();
                    makeComment(e, item._id);
                  }}
                >
                  <input
                    className="commentInput"
                    type="text"
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="add a comment"
                    style={{
                      float: 'left',
                    }}
                  />
                  <a
                    type="submit"
                    className="waves-effect waves-light btn commentSubmit"
                    onClick={(e) => {
                      e.preventDefault();
                      makeComment(e, item._id);
                    }}
                  >
                    Post
                  </a>
                </form>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Home;
