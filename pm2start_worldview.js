/**
 * Created by lenovo on 2016/6/13.
 */
var Pm2ConfigList = require('./pm2_config.json');
console.log(Pm2ConfigList);

var pm2 = require('pm2');
pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.start(Pm2ConfigList, function (err, apps) {
        pm2.disconnect();   // Disconnect from PM2
        if (err) {
            console.log("err:"  );

            console.log(  err);
            throw err;
        }
    });
});