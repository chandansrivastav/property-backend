$(document).ready(() => {
    dataTable()
})

function dataTable() {
    $("#static_pageTable").DataTable().destroy();
    $("#testimonialTable").DataTable().destroy();
    $("#blogsTable").DataTable().destroy();
    $("#newsTable").DataTable().destroy();
    $("#locationTable").DataTable().destroy();
    $("#categoryTable").DataTable().destroy();
    $("#propertyTable").DataTable().destroy();
    $("#propertyTbl").DataTable().destroy();
    $("#propertyReqTable").DataTable().destroy();
    $("#agentTable").DataTable().destroy();
    $("#contactUsTable").DataTable().destroy();
    $("#staticImageTable").DataTable().destroy();
    
    $("#static_pageTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_static_page/list",
            type: "POST",
            data: {}
        }
    });
    $("#testimonialTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_testimonial/list",
            type: "POST",
            data: {}
        }
    });
    $("#blogsTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_blogs/list",
            type: "POST",
            data: {}
        }
    });
    $("#newsTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_news/list",
            type: "POST",
            data: {}
        }
    });
    $("#locationTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_location/list",
            type: "POST",
            data: {}
        }
    });
    $("#categoryTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_category/list",
            type: "POST",
            data: {}
        }
    });
    $("#propertyTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_property/list",
            type: "POST",
            data: {}
        }
    });
    $("#propertyReqTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_property_request/list",
            type: "POST",
            data: {}
        }
    });
    $("#agentTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_agent/list",
            type: "POST",
            data: {}
        }
    });
    $("#contactUsTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_contact_us/list",
            type: "POST",
            data: {}
        }
    });
    $("#staticImageTable").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/admin/manage_static_image/list",
            type: "POST",
            data: {}
        }
    });

    //agent datatable
    $("#propertyTbl").DataTable({
        processing: true,
        serverSide: true,
        ordering: false,
        searching: true,
        ajax: {
            url: "/v1/agent/manage_property/list",
            type: "POST",
            data: {}
        }
    });
}