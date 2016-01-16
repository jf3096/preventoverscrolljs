var express = require('express'),
    app = express(),
    server = require('http').Server(app);

app.use("/lib", express.static(__dirname + '/lib'));

app.use('/*', function (req, res) {
    res.sendfile(__dirname + '/examples/demo.html');
});

server.listen(3004, function () {
    console.log('Listening on port http://localhost:%d', server.address().port);
});