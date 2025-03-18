function submit_form(id) {
    const formValid = $("#" + id).valid();
    if (formValid) {
        let url = $("#" + id).attr("action");
        let method = $("#" + id).attr("method");
        let formData = $("#" + id).serialize();
        $.ajax({
            type: method,
            url: url,
            data: formData,
            success: function (response) {
                alert("successfully save");
            },
            error: function (error) {
                alert("failure");
            }
        });
    }
}