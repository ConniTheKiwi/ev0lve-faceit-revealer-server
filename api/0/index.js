// Im aware this code is shite dont flame me i made it in a few hours.

const http = require ('http');
const url = require('url');
const request = require('request-promise');

const app = http.createServer( async (req, res) => {
    const parsedURL = url.parse(req.url, true);
    handle(parsedURL, res);
});

app.listen(80);

async function handle(parsedURL, res)
{
    if(parsedURL.pathname == "/api/0/faceit/userinfo") {
        const rp = require('request-promise');
          var options = {
            uri: 'https://open.faceit.com/data/v4/search/players',
            qs: {
                nickname: `${parsedURL.query.steam_32}`,
                offset: '0',
                limit: `1`
            },
            headers: {
                "accept": "application/json",
                "Authorization" : `Bearer ${parsedURL.query.api_key}`
            },
            json: true
        };
        
        rp(options)
            .then(function (repos) {
                console.log("Got user infomation");
                console.log(JSON.stringify(repos.items[0]));
                res.statusCode = 200;
                res.setHeader('content-type', 'Application/json');
                res.end(JSON.stringify(repos.items[0]));
            })
            .catch(function (err) {
                // API call failed

            });
    }
    else if(parsedURL.pathname == "/api/0/faceit/userinfo/output") {
        if(parsedURL.query.steam_32 == "0") {
            res.end("Cant get info about bots...")
            console.log("Cant get bot infomation")
            return;
        }
        console.log("Getting user infomation")
        var response = await request(`http://localhost:80/api/0/faceit/userinfo?steam_32=${parsedURL.query.steam_32}&api_key=${parsedURL.query.api_key}`, { json: true });
        if(response == undefined) {
            res.statusCode = 200;
            res.setHeader('content-type', 'Application/json');
            res.end("123");
            console.log("returning: 123")
            return;
        }
        console.log(`http://localhost:80/api/0/faceit/userinfo?steam_32=${parsedURL.query.steam_32}&api_key=${parsedURL.query.api_key}`);

        var i;
        var csgo_rank;
        var faceit_nickname = response["nickname"];
        console.log(response);

        for (i = 0; i < response["games"].length; i++) {
            console.log(response["games"][0]);
            if(response["games"][i].name == "csgo") {
                csgo_rank = (response["games"][0]["skill_level"]);
            }
        }

        if(csgo_rank == undefined) {
            res.statusCode = 200;
            res.setHeader('content-type', 'Application/json');
            res.end("123");
            console.log("returning: 123 - as user doesny play csgo on faceit"); 
            return;
        }

        res.statusCode = 200;
        res.setHeader('content-type', 'Application/json');
        res.end(`Faceit User (${faceit_nickname}) is Faceit Level: ${csgo_rank}`)
        console.log(`Returning: Faceit User (${faceit_nickname}) is Faceit Level: ${csgo_rank}`)
        return;
    }
    else {
        res.statusCode = 400;
        res.end("API Endpoint Not Supported");
    }
}