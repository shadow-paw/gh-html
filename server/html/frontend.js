class Frontend {
    constructor() {}

    repo_query(cb) {
        $.getJSON("rest/repo-query")
            .done(function(data) {
                cb(true, data);
            })
            .fail(function(jqxhr, textStatus, error) {
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data = { "error": "ERROR" };
                }
                cb(false, data);
            });
    }
};
