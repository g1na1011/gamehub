const request = require('supertest-as-promised');
const app = require('../server/server');
const bookshelf = require('../server/db/psqldb');
const db = require('../server/db/psqldb');

beforeEach(() => {
  this.mockUser = {
    name: 'Tester1', 
    email: 'hello@mks.com', 
    pic_path: 'testimage.jpg', 
    routeProp: 'val'
  };

  this.existingUser = {
    name: 'Gina Zhou',
    email: 'g1na1011@gmail.com',
    pic_path: 'https://scontent.xx.fbcdn.net/t31.0-1/12771953_10205948725971326_3059424567126164428_o.jpg',
    routeProp: 'val'
  };

  this.fakeProfile = {
    name: "Fakester",
    location: "MKS SF",
    bio: "I love coding",
    email: "hello@mks.com"
  };

});

afterEach(() => {
  db.knex('users')
    .where('email', '=', `${this.mockUser.email}`)
    .del()
    .catch(function(error) {
      // uncomment when writing authentication tests
      // throw {
      //   type: 'DatabaseError',
      //   message: 'Failed to create test setup data'
      // };
    });
});

describe ('Server Loading', () => {
  describe ('GET /', () => {

    it ('Returns status code 200', done => {
      request(app)
        .get('/')
        .then(res => {
          expect(res.statusCode).toEqual(200);
          done();
        })
        .catch(done.fail);
    });
  });
});

describe ('Sign Up', () => {

  describe ('POST /signup', () => {
    it ('Adds new user and returns new user object', done => {
      request(app)
        .post('/signup')
        .send(this.mockUser)
        .then(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toEqual({
            name: 'Tester1', 
            email: 'hello@mks.com', 
            routeProp: 'not found'
          })
          done();
        })
        .catch(done.fail);
    });

    it ('Finds existing user and returns existing user object', done => {
      request(app)
        .post('/signup')
        .send(this.existingUser)
        .then(res => {
          expect(res.body).toEqual({
            name: 'Gina Zhou',
            email: 'g1na1011@gmail.com',
            routeProp: 'found'
          })
          done();
        })
        .catch(done.fail);
    });
  });
});

describe ('POST /favmedia', () => {
  it ('Returns an array of data with existing user who posted videos', done => {
    request(app)
      .post('/favmedia')
      .send([null, 'g1na1011@gmail.com'])
      .then(res => {
        expect(res.body.length >= 1);
        done();
      })
      .catch(done.fail);
  });
});

describe ('POST /get_users', () => {
  it ('Returns users related to a search term of a name', (done) => {
    request(app)
      .post('/get_users')
      .send({searchTerm: 'Sam'})
      .then(res => {
        expect(res.body.length).toEqual(2);
        done();
      });
  });

  it ('Returns an empty array if search term is empty', (done) => {
    request(app)
      .post('/get_users')
      .send({searchTerm: ''})
      .then(res => {
        expect(res.body).toEqual([]);
        done();
      });
  });
})

describe ('POST /post_profile', () => {
  it("Returns a error response when an unknown profile attempts to update", (done) => {
      request(app)
        .post('/post_profile')
        .send(this.fakeProfile)
        .then(res => {
          expect(res.body.status).toEqual("EMAIL ADDRESS NOT FOUND!");
          done();
        });
  });

  it("Returns a confirmation response when a profile is updated", done => {
     request(app)
      .post('/post_profile')
      .send(this.existingUser)
      .then(res => {
        expect(res.body.status).toEqual("POST SUCCESSFULL!")
        done();
      });
  });
});

describe ('POST /get-games', () => {
  it("Should return an array of games greater than one", done => {
    request(app)
    .post('/fetch_games')
    .send({email: 'kyle@mks.com'})
    .then(res => {
      expect(res.body.data.length > 1).toEqual(true);
      done();
    });
  })
});

describe('POST /show_friends', () => {
  it("Should return an array of friends for an existing user", done => {
    request(app)
      .post('/show_friends')
      .send({email: 'kyle@mks.com'})
      .then(res => {
        expect(res.body.data.length >1).toEqual(true);
        done();
      });
  });
});

describe('POST /show_followers', () => {
  it("Should return an array of people who are following this user", done=> {
    request(app)
      .post('/show_followers').
      send({email: 'kyle@mks.com'})
      .then(res => {
        expect(res.body.data.length >1).toEqual(true);
        done();
      });
  });
});

describe('POST /get_user_info', () => {
  it("Should an object containting the user's info", done => {
    request(app)
      .post('/get_user_info')
      .send({email: "kyle@mks.com"})
      .then(res => {
        expect(Object.keys(res.body.found).length>3).toEqual(true);
        done();
      });
  });

  it("Should retun a 'not found' status for an incorrect email", done => {
    request(app)
      .post('/get_user_info')
      .send({email: 'balogne@balogne.com'})
      .then(res => {
        expect(res.body.status).toBe("Not Found");
        done();
      });
  });
});

describe('POST /get_friend_info', () => {
  it("Should return a status of 'Found' for two individuals who are friends", done => {
    request(app)
      .post('/get_friend_info')
      .send({friend1: 'kyle@mks.com', friend2: 'captainhook@mks.com'})
      .then(res => {
        expect(res.body.status).toBe("Found");
        done();
      });
  });

  it("Should return a status of 'Not Found' for two individuls who are not friends", done => {
    request(app)
      .post('/get_friend_info')
      .send({friend1: 'g1na1011@gmail.com', friend2: 'captainhook@mks.com'})
      .then(res => {
        expect(res.body.status).toBe("Not Found");
        done();
      });
  });
})

describe('POST /show_game_fans', () => {
  it('Should return an array of fans of a game', done => {
    request(app)
      .post('/show_game_fans')
      .send({game: 'Starcraft'})
      .then(res => {
        expect(res.body.data.length).toBeGreaterThan(1);
        done();
      });
  });
});

describe ('POST /add_friend', () => {
  it("Should return a string indicating whether the friend was added or removed", done => {
    request(app)
      .post('/add_friend')
      .send({friend1: "kyle@mks.com", friend2: "captainhook@mks.com"})
      .then(res => {
        expect(typeof res.body.action).toEqual('string');
        done();
      })
  })
})