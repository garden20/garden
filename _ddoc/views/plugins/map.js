function map(doc) {
    if (doc.plugin && doc.plugin.type === 'futon-plugin' && doc.plugin.main) {
        emit(doc._id, doc.plugin.main);
    }
}