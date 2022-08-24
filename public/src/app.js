const loadPageDetails = async (id) => {
    console.log('clicked', id);
    $('#scraped_data_wrapper').hide();
    const result = await fetch(`/api/v1/websites_data/${id}`).then(res => res.json());
    buildTableFromWebsiteJsonData(result);
};

const buildTableFromWebsiteJsonData = (websiteData) => {
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-sm table-bordered table-hover');
    table.setAttribute('boarder', '1');
    for (const k of Object.keys(websiteData)) {
        const row = document.createElement('tr');
        const tdBold = document.createElement('td');
        tdBold.innerText = k;
        const td = document.createElement('td');

        if (['divIdMain', 'divClassMain', 'consoleContent', 'backgroundRequests', 'cookies'].includes(k)) {
            const ifr = document.createElement('iframe');
            let html = '';
            if (['backgroundRequests', 'cookies'].includes(k)) {
                const requestLists = websiteData[k].split(';').map(r => `<li>${r.replace('[status', ' -> [status')}</li>`);
                html = `<ul>${requestLists.join('\n')}</ul>`;
            } else {
                html = websiteData[k];
            }
            ifr.srcdoc = `<html><body>${html}</body></html>`;
            td.appendChild(ifr);
        } else {
            td.innerText = websiteData[k];
        }

        row.appendChild(tdBold);
        row.appendChild(td);
        table.appendChild(row);
    };
    document.body.appendChild(table);
}

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
            {
                data: 'id',
                render: (data) => {
                    return `<button type="button" id="load_website_data_${data}" class="btn btn-primary btn-sm" onclick="loadPageDetails(${data})" record_id=${data}>Load details</button>`
                }
            },
        ]
    });
});
