$(function () {
    $('.summernote-editor').summernote({
        placeholder: 'Enter Content',
        tabsize: 2,
        height: 200,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ol', 'ul', 'paragraph', 'height']],
            ['table', ['table']],
            ['insert', ['link']],
            ['view', ['undo', 'redo', 'fullscreen', 'codeview', 'help']]
        ]
    });
    $(".single-image").change(function () {
        let reader = new FileReader();
        reader.onload = (evt) => {
            $("#previewImage").html(`<img src="${evt.target.result}" height="100">`)
        }
        if ($(this).prop("files").length > 0) {
            reader.readAsDataURL($(this).prop("files")[0])
        }
    })
    $(".multiple-image").change(function () {
        if ($(this).prop("files").length > 0) {
            $("#previewImage").html("");
            for (let data of $(this).prop("files")) {
                let reader = new FileReader();
                reader.onload = (evt) => {
                    $("#previewImage").append(`<img src="${evt.target.result}" height="100">`)
                }
                reader.readAsDataURL(data);
            }
        }
    })
    $('.product-image-thumb').on('click', function () {
        var image_element = $(this).find('img')
        $('.product-image').prop('src', $(image_element).attr('src'))
        $('.product-image-thumb.active').removeClass('active')
        $(this).addClass('active')
    })
});

function copyText(value) {
    navigator.clipboard.writeText(value);
    Swal.fire({
        title: "Success!",
        text: "Successfully copied.",
        type: "success"
    })
}

function changeStatus(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You want to change status!",
        type: "warning",
        showCancelButton: !0,
        confirmButtonText: "Yes, change it!",
        cancelButtonText: "No, cancel!",
        confirmButtonClass: "btn btn-success mt-2",
        cancelButtonClass: "btn btn-danger ml-2 mt-2",
        buttonsStyling: !1
    }).then(function (result) {
        if (result.value) {
            $.ajax({
                url: location.pathname + "/change_status/" + id,
                success: function (response) {
                    if (response && response.status == "success") {
                        Swal.fire({
                            title: "Changed!",
                            text: response.message ? response.message : "Your record status change successfully.",
                            type: "success"
                        })
                        dataTable();
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.message ? response.message : "Record is not updated properly. please try again",
                            type: "error"
                        })
                    }
                }
            })
        } else {
            Swal.fire({
                title: "Cancelled",
                text: "Your record status is not change.",
                type: "info"
            })
        }
    })
}

function deleteRecord(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: !0,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        confirmButtonClass: "btn btn-success mt-2",
        cancelButtonClass: "btn btn-danger ml-2 mt-2",
        buttonsStyling: !1
    }).then(function (result) {
        if (result.value) {
            $.ajax({
                url: location.pathname + "/delete/" + id,
                success: function (response) {
                    if (response && response.status == "success") {
                        Swal.fire({
                            title: "Deleted!",
                            text: response.message ? response.message : "Your record has been deleted.",
                            type: "success"
                        })
                        dataTable();
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.message ? response.message : "Record is not delete properly. please try again",
                            type: "error"
                        })
                    }
                }
            });
        } else {
            Swal.fire({
                title: "Cancelled",
                text: "Your record is safe.",
                type: "info"
            })
        }
    })
}

function dataAddModal(id) {
    let url = location.pathname;
    id ? url += "/edit/" + id : url += "/add";
    $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            $("#htmlModal").html(response);
            $("#dataAddModal").modal("show");
        }
    })
}

function changePropertyStatus(status) {
    if (status == "rejected" || status == "re-rejected") {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to change property status as ${status}!`,
            type: "warning",
            showCancelButton: !0,
            input: "text",
            inputPlaceholder: "Enter reject reason...",
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_property/change_property_status",
                    type: "POST",
                    data: { id, status, reason: result.value },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Property Status Update!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            });
                            $("#property-status").html(` <div class="mt-2">
                                <div class="btn btn-info btn-lg btn-flat" onclick="changePropertyStatus('re-approved')">
                                    Approve Property
                                </div>
                                <div class="btn btn-danger btn-lg btn-flat" onclick="changePropertyStatus('re-rejected')">
                                    Re-Reject
                                </div>
                            </div>
                            <p><strong>Reject Reason: </strong>${result.value}</p>`);
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Your record is safe.",
                    type: "info"
                })
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Please enter reject reason.",
                    type: "error"
                })
            }
        });
    } else {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to change property status as ${status}!`,
            type: "warning",
            showCancelButton: !0,
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_property/change_property_status",
                    type: "POST",
                    data: { id, status },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Property Status Update!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            });
                            if (status == 'sold') {
                                $("#property-status").html(`<div class="mt-2">
                                    <div class="btn btn-success btn-lg btn-flat">
                                        Sold
                                    </div>
                                </div>`);
                            } else if (status == 'approved') {
                                $("#property-status").html(`<div class="mt-2">
                                    <div class="btn btn-primary btn-lg btn-flat" onclick="changePropertyStatus('sold')">
                                        Mark as Sold
                                    </div>
                                </div>`);
                            } else if (status == 're-approved') {
                                $("#property-status").html(`<div class="mt-2">
                                    <div class="btn btn-primary btn-lg btn-flat" onclick="changePropertyStatus('sold')">
                                        Mark as Sold
                                    </div>
                                </div>`);
                            }
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else {
                Swal.fire({
                    title: "Cancelled",
                    text: "Your record is safe.",
                    type: "info"
                })
            }
        });
    }
}

function markAsCloseContactUs(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You want to close this query!",
        type: "warning",
        showCancelButton: !0,
        input: "text",
        inputPlaceholder: "Enter remarks...",
        confirmButtonText: "Yes, close it!",
        cancelButtonText: "No, cancel!",
        confirmButtonClass: "btn btn-success mt-2",
        cancelButtonClass: "btn btn-danger ml-2 mt-2",
        buttonsStyling: !1
    }).then(function (result) {
        if (result.value) {
            $.ajax({
                url: "/v1/admin/manage_contact_us/change_status/" + id,
                type: "POST",
                data: { remarks: result.value },
                success: function (response) {
                    if (response && response.status == "success") {
                        Swal.fire({
                            title: "Changed!",
                            text: response.message ? response.message : "Your record status change successfully.",
                            type: "success"
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: response.message ? response.message : "Record is not updated properly. please try again",
                            type: "error"
                        })
                    }
                }
            })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Your record status is not change.",
                type: "info"
            })
        } else {
            Swal.fire({
                title: "Error",
                text: "Please enter remarks.",
                type: "error"
            })
        }
    })
}

function verifyAgent(status) {
    if (status == "Approved") {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to approve this agent!`,
            type: "warning",
            showCancelButton: !0,
            confirmButtonText: "Yes, approve it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_agent/verify_agent",
                    type: "POST",
                    data: { id, status },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Success!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else {
                Swal.fire({
                    title: "Cancelled",
                    text: "Don't worry your record is safe.",
                    type: "info"
                })
            }
        });
    } else {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to reject this agent!`,
            type: "warning",
            showCancelButton: !0,
            input: "text",
            inputPlaceholder: "Enter reject reason...",
            confirmButtonText: "Yes, reject it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_agent/verify_agent",
                    type: "POST",
                    data: { id, status, reason: result.value },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Success!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Don't worry your record is safe.",
                    type: "info"
                })
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Please enter reject reason.",
                    type: "error"
                })
            }
        });
    }
}

function propertyReqStatusMark(status) {
    if (status == "Accepted") {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to accept this deal!`,
            type: "warning",
            showCancelButton: !0,
            input: "text",
            inputPlaceholder: "Enter accept remark...",
            confirmButtonText: "Yes, accept it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_property_request/change_status/" + id,
                    type: "POST",
                    data: { status, remarks: result.value },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Success!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Don't worry your record is safe.",
                    type: "info"
                })
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Please enter accept remark.",
                    type: "error"
                })
            }
        });
    } else {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to reject this deal!`,
            type: "warning",
            showCancelButton: !0,
            input: "text",
            inputPlaceholder: "Enter reject remark...",
            confirmButtonText: "Yes, reject it!",
            cancelButtonText: "No, cancel!",
            confirmButtonClass: "btn btn-success mt-2",
            cancelButtonClass: "btn btn-danger ml-2 mt-2",
            buttonsStyling: !1
        }).then(function (result) {
            if (result.value) {
                let id = location.pathname.split("/").pop();
                $.ajax({
                    url: "/v1/admin/manage_property_request/change_status/" + id,
                    type: "POST",
                    data: { status, remarks: result.value },
                    success: function (response) {
                        if (response && response.status == "success") {
                            Swal.fire({
                                title: "Success!",
                                text: response.message ? response.message : "Your record has been updated.",
                                type: "success"
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: response.message ? response.message : "Record is not update properly. please try again",
                                type: "error"
                            })
                        }
                    }
                })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Don't worry your record is safe.",
                    type: "info"
                })
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Please enter reject remark.",
                    type: "error"
                })
            }
        });
    }
}