/**
 * Created by nilsbergmann on 26.11.16.
 */
const r = require('rethinkdb');
const async = require('async');

class depCreator {
    constructor (options) {
        this.depDBs = options.dbs;
        if (options.con) this.con = options.con;
        if (options.con_options) this.con_options = options.con_options;
    }

    doYourJob(callback) {
        this.connect((err) => {
            if (err) return callback(err);
            async.each(this.depDBs, (db, call1) => {
                r.dbList().contains(db.name).run(this.con, (err, result) => {
                    if (result){
                        if (db.recreate){
                            r.dbDrop(db.name).run(this.con, (err, result) => {
                                if (err) return call1(err);
                                this.createDB(db, call1);
                            });
                        } else {
                            async.each(db.tables, (table, call2) => {
                                this.createTable(db, table, call2);
                            }, (err) => {
                                if (err) return call1(err);
                                call1();
                            });
                        }
                    } else {
                        this.createDB(db, call1);
                    }
                });
            }, (err) => {
                if (err) return callback(err);
                callback();
            });
        });
    }

    createDB(db, callback) {
        console.log(db.name);
        r.dbCreate(db.name).run(this.con, (err, result) => {
            if (err) return callback(err);
            async.each(db.tables, (table, call) => {
                this.createTable(db, table, call);
            }, (err) => {
                if (err) return callback(err);
                callback();
            });
        });
    }

    createTable(currentdb, table, callback) {
        r.db(currentdb.name).tableList().contains(table.name).run(this.con, (err, result) => {
            if (err) return callback(err);
            if (result) {
                if (table.recreate){
                    r.db(currentdb.name).tableDrop(table.name).run(this.con, (err) => {
                        if (err) return callback(err);
                        r.db(currentdb.name).tableCreate(table.name).run(this.con, (err) => {
                            if (err) return callback(err);
                            async.each(table.indexes, (index, call) => {
                                this.createIndexes(currentdb, table, index, call);
                            }, (err) => {
                                if (err) return callback(err);
                                callback();
                            });
                        });
                    });
                } else {
                    async.each(table.indexes, (index, call) => {
                        this.createIndexes(currentdb, table, index, call);
                    }, (err) => {
                        if (err) return callback(err);
                        callback();
                    });
                }
            } else {
                r.db(currentdb.name).tableCreate(table.name).run(this.con, (err) => {
                    if (err) return callback(err);
                    async.each(table.indexes, (index, call) => {
                        this.createIndexes(currentdb, table, index, call);
                    }, (err) => {
                        if (err) return callback(err);
                        callback();
                    });
                });
            }
        });
    }

    createIndexes(currentdb, table, index, callback) {
        r.db(currentdb.name).table(table.name).indexList().contains(index.name).run(this.con, (err, result) => {
            if (err) return callback(err);
            if (result) {
                // TODO: Check options with existing index
                if (index.recreate) {
                    r.db(currentdb.name).table(table.name).indexDrop(index.name).run(this.con, (err) => {
                        if (err) return callback(err);
                        r.db(currentdb.name).table(table.name).indexCreate(index.name, index.options).run(this.con, (err) => {
                            if (err) return callback(err);
                            callback();
                        });
                    });
                } else {
                    callback();
                }
            } else {
                r.db(currentdb.name).table(table.name).indexCreate(index.name, index.options).run(this.con, (err, result) => {
                    if (err) return callback(err);
                    callback();
                });
            }
        });
    }

    connect(callback) {
        if (this.con) {
            callback();
        } else {
            if (this.con_options){
                r.connect(this.con_options, (err, connection) => {
                    if (err) return callback(err);
                    this.con = connection;
                    callback();
                });
            } else {
                callback("You need to give me a fu**ing connection or options");
            }
        }
    }
}

module.exports = depCreator;