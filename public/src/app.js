$(document).ready(function () {
    $('#scraped_data').DataTable({
        processing: true,
        serverSide: true,
        ajax: 'http://localhost:3000/api/v1/websites_data',
        columns: [
            { data: 'uri' },
            { data: 'baseLabel' },
            { data: 'version' },
            { data: 'dateLabel' },
            { data: 'buildNo' },
            { data: 'companyId' },
            { data: 'title' },
            { data: 'eCommerceType' },
        ]
    });
});