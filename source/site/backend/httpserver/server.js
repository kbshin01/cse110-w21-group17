// serve website
const express = require('express');
const http = require('http');
var https = require('https');
const fs = require('fs');
const app = express();
const httpport = 80;

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/cse110.bobobobobobo.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/cse110.bobobobobobo.net/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/cse110.bobobobobobo.net/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// serve database
const jsonServer = require('json-server')
const jsonport = 5000;
const server = jsonServer.create()
const router = jsonServer.router('backend/data/db.json')
const middlewares = jsonServer.defaults()

// server rest api
const axios = require('axios')
app.use(express.json());


console.log(process.cwd()); // Should start at site folder

// serve website
var root_dir = process.cwd() + "/frontend";

app.get('/user(/*)', function (req, res) {
  res.sendFile('/html/timer.html', {
    root: "./frontend"
  });
});

app.get('/', function (req, res) {
  res.sendFile('/html/timer.html', {
    root: "./frontend"
  });
});

app.use('/', express.static(root_dir));


// Start http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(httpport, () => {
	console.log(`HTTP Server running on port ${httpport}`);
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});


// serve database
server.use(middlewares)
server.use(router)
server.listen(jsonport, () => {
  console.log(`json server running on port ${jsonport}!`)
})


// server rest api
app.post('/fetchuserdata', async function (request, response) {
  let fetch_request = request.body;
  if ('token' in fetch_request) {
    let access_token = fetch_request["token"];
    axios.get(`http://localhost:5000/userdata/${access_token}`)
      .then(res => {
        response.send(res.data);
      })
      .catch(error => {
        axios.post(`http://localhost:5000/userdata/`, {
          "id": access_token,
          "task_list_data": [],
          "user_log": {
            "last_active": Date.now(),
            "timer_state": {
              "current": "timer_init",
              "previous": null
            },
            "current_task": null,
            "break_status": {
              "break": "short_break",
              "cycles": 0
            },
          },
          "settings": {
            "working_sec": 1500,
            "short_break_sec": 300,
            "short_break_cycles": 3,
            "long_break_sec": 480,
            "long_break_cycles": 1,
            "allow_emergency_stop": true
          }
        }).then(res => response.send(res.data));
      });
  }
});

app.post('/uploaduserdata', async function (request, response) {
  let fetch_request = request.body;
  if ('data' in fetch_request && 'token' in fetch_request) {
    let access_token = fetch_request["token"];
    axios.put(`http://localhost:5000/userdata/${access_token}`, fetch_request["data"]).then(res => response.send(res.data));
  }
});

app.post('/online', async function (request, response) {
  let timestamp_thres = Date.now() - 2 * 60 * 1000; // being active at most 2 minutes ago
  axios.get(`http://localhost:5000/userdata?user_log.last_active_gte=${timestamp_thres}`)
    .then(res => response.send(res.data.map((x) => {
      return { "id": x.id, "state": x.user_log.timer_state.current };
    })));
});

app.post('/delete_user', async function (request, response) {
  let fetch_request = request.body;
  console.log(fetch_request);
  if ('token' in fetch_request) {
    let access_token = fetch_request["token"];
    axios.delete('http://localhost:5000/userdata/' + access_token);
  }
});
