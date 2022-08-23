$(document).ready(function () {
    $('#scraped_data').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        bPaginate: true,
        bLengthChange: true,
        bInfo: true,
        sPaginationType: 'full_numbers',
        pagingType: 'full_numbers',
        ajax: '/api/v1/websites_data',
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
