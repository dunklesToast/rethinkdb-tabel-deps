# Let this stupid module create your db`s

I wrote this module because I was bored to write the world biggest waterfall to create all of my db`s and table`s and indexes for my applications.

### Example

```javascript
const depCreator = require("rethinkdb-tabel-deps");

new depCreator({
    // Options for r.connect()
    con_options: {},
    // List of dbs to create
    dbs: [
        {
            name: "niceDB1",
            // If this is true, the db will be deleted ad startup and recreated
            recreate: false,
            tables: [
                {
                    name: "table1",
                    recreate: false,
                    indexes: [
                        {
                            name: "testIndex",
                            // Index options
                            options: {
                                multi: false,
                                geo: false
                            },
                            recreate: false
                        }
                    ]
                }
            ]
        },
        {
            name: "beautifulDB",
            recreate: true,
            tables: [
                {
                    name: "superTable"
                }
            ]
        }
    ]
}).doYourJob((err) => {
    if (err) console.error(err);
    console.log("I created this sh**t for you.");
});

```
