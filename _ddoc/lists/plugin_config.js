function list(head, req) {
    start({code: 200, headers: {'Content-Type': 'application/x-javascript'}});
    send('define([');

    var row,
        count = 0,
        rows = [];

    while (row = getRow()) {
        count++;
        send("'../_db/" + row.id + "/" + row.value +  "'");
    }

    send('], function () {');
    send('    console.log("' + count +'  plugins loaded ");     ');
    send('    return Array.prototype.slice.call(arguments);');
    send('});');

}