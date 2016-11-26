/**
 * Created by nilsbergmann on 26.11.16.
 */
const depCreator = require("../index");

new depCreator({
    con_options: {},
    dbs: [
        {
            name: "test1db",
            recreate: false,
            tables: [
                {
                    name: "table1",
                    recreate: false,
                    indexes: [
                        {
                            name: "testIndex",
                            options: {
                                multi: false
                            },
                            recreate: false
                        }
                    ]
                }
            ]
        },
        {
            name: "oha",
            recreate: true,
            tables: [
                {
                    name: "yeah"
                }
            ]
        }
    ]
}).doYourJob((err) => {
    if (err) console.error(err);
    console.log("Finished.");
});